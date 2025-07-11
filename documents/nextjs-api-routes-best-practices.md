# Next.js API Routes ベストプラクティス

## 1. 概要

Next.js App Router におけるAPI Routesの標準的な実装方法、ベストプラクティス、パフォーマンス最適化、セキュリティ対策について説明します。

## 2. 基本的な実装パターン

### 2.1 HTTPメソッド別の関数定義

App Routerでは、HTTPメソッドに対応する特定の関数名を使用する必要があります。

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET リクエスト
export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST リクエスト
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    );
  }
}

// PUT リクエスト
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await updateUser(body);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 400 }
    );
  }
}

// DELETE リクエスト
export async function DELETE(request: NextRequest) {
  try {
    await deleteUser();
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 400 }
    );
  }
}
```

### 2.2 動的ルーティング

#### 2.2.1 基本的な動的ルーティング
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.2.2 Catch-all Routes
```typescript
// app/api/files/[...path]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const file = await getFile(filePath);
    
    return new NextResponse(file.buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
```

## 3. レスポンス形式の標準化

### 3.1 統一されたレスポンス形式

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// utils/response.ts
export function createSuccessResponse<T>(
  data: T, 
  message?: string
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  
  return NextResponse.json(response);
}

export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  
  return NextResponse.json(response, { status });
}
```

### 3.2 使用例

```typescript
// app/api/users/route.ts
import { createSuccessResponse, createErrorResponse } from '@/utils/response';

export async function GET() {
  try {
    const users = await getUsers();
    return createSuccessResponse(users, 'Users retrieved successfully');
  } catch (error) {
    return createErrorResponse('Failed to fetch users', 500);
  }
}
```

## 4. バリデーション

### 4.1 入力値検証

```typescript
// schemas/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
```

```typescript
// app/api/users/route.ts
import { createUserSchema } from '@/schemas/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = createUserSchema.parse(body);
    
    const user = await createUser(validatedData);
    return createSuccessResponse(user, 'User created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }
    
    return createErrorResponse('Failed to create user', 500);
  }
}
```

### 4.2 ミドルウェア的なバリデーション

```typescript
// utils/validation.ts
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    const body = await request.json();
    return schema.parse(body);
  };
}

// 使用例
export async function POST(request: NextRequest) {
  try {
    const validatedData = await withValidation(createUserSchema)(request);
    const user = await createUser(validatedData);
    return createSuccessResponse(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation failed', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}
```

## 5. 認証・認可

### 5.1 JWT トークン検証

```typescript
// utils/auth.ts
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.slice(7);
  
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
```

### 5.2 認証ミドルウェア

```typescript
// utils/middleware.ts
export function withAuth(
  handler: (request: NextRequest, user: AuthUser, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const user = getAuthUser(request);
    
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    return handler(request, user, context);
  };
}

// 使用例
export const GET = withAuth(async (request, user, { params }) => {
  const users = await getUsersForRole(user.role);
  return createSuccessResponse(users);
});
```

### 5.3 ロールベースアクセス制御

```typescript
// utils/rbac.ts
export function withRole(requiredRole: string) {
  return function(
    handler: (request: NextRequest, user: AuthUser, context: any) => Promise<NextResponse>
  ) {
    return withAuth(async (request, user, context) => {
      if (user.role !== requiredRole) {
        return createErrorResponse('Forbidden', 403);
      }
      
      return handler(request, user, context);
    });
  };
}

// 使用例
export const DELETE = withRole('admin')(async (request, user, { params }) => {
  await deleteUser(params.id);
  return createSuccessResponse(null, 'User deleted successfully');
});
```

## 6. エラーハンドリング

### 6.1 カスタムエラークラス

```typescript
// errors/api-error.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super('Unauthorized', 401, 'UNAUTHORIZED');
  }
}
```

### 6.2 グローバルエラーハンドラー

```typescript
// utils/error-handler.ts
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.statusCode);
  }
  
  if (error instanceof z.ZodError) {
    const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return createErrorResponse(`Validation error: ${message}`, 400);
  }
  
  // 本番環境では詳細なエラー情報を隠す
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : (error as Error).message;
    
  return createErrorResponse(message, 500);
}

// 使用例
export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    return createSuccessResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 7. パフォーマンス最適化

### 7.1 キャッシュ戦略

```typescript
// utils/cache.ts
export function withCache(maxAge: number = 3600) {
  return function(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: any) => {
      const response = await handler(request, context);
      
      response.headers.set(
        'Cache-Control',
        `public, max-age=${maxAge}, s-maxage=${maxAge}`
      );
      
      return response;
    };
  };
}

// 使用例
export const GET = withCache(1800)(async (request) => {
  const data = await getStaticData();
  return createSuccessResponse(data);
});
```

### 7.2 レスポンス圧縮

```typescript
// utils/compression.ts
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function compressResponse(data: any): Promise<NextResponse> {
  const jsonString = JSON.stringify(data);
  
  // 大きなレスポンスのみ圧縮
  if (jsonString.length > 1024) {
    const compressed = await gzipAsync(jsonString);
    
    return new NextResponse(compressed, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
  }
  
  return NextResponse.json(data);
}
```

### 7.3 ストリーミングレスポンス

```typescript
// app/api/large-data/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const data = await getLargeDataset();
        
        for (const item of data) {
          const chunk = encoder.encode(JSON.stringify(item) + '\n');
          controller.enqueue(chunk);
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

## 8. セキュリティ対策

### 8.1 レート制限

```typescript
// utils/rate-limit.ts
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimit(
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15分
) {
  return function(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: any) => {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const record = rateLimitStore.get(ip);
      
      if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return handler(request, context);
      }
      
      if (record.count >= limit) {
        return createErrorResponse('Too many requests', 429);
      }
      
      record.count++;
      return handler(request, context);
    };
  };
}

// 使用例
export const POST = rateLimit(10, 60000)(async (request) => {
  const user = await createUser(await request.json());
  return createSuccessResponse(user);
});
```

### 8.2 CORS設定

```typescript
// utils/cors.ts
export function withCORS(
  origins: string[] = ['http://localhost:3000'],
  methods: string[] = ['GET', 'POST', 'PUT', 'DELETE']
) {
  return function(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: any) => {
      const origin = request.headers.get('origin');
      
      // Preflight request
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origins.includes(origin || '') ? origin! : origins[0],
            'Access-Control-Allow-Methods': methods.join(', '),
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
      
      const response = await handler(request, context);
      
      // CORS headers
      response.headers.set(
        'Access-Control-Allow-Origin',
        origins.includes(origin || '') ? origin! : origins[0]
      );
      
      return response;
    };
  };
}
```

### 8.3 入力サニタイゼーション

```typescript
// utils/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

export function withSanitization(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.json();
      const sanitizedBody = sanitizeInput(body);
      
      // 新しいリクエストオブジェクトを作成
      const sanitizedRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody),
      });
      
      return handler(sanitizedRequest, context);
    }
    
    return handler(request, context);
  };
}
```

## 9. ログ記録

### 9.1 構造化ログ

```typescript
// utils/logger.ts
export interface LogContext {
  requestId: string;
  userId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
}

export function createLogger(context: LogContext) {
  return {
    info: (message: string, meta?: any) => {
      console.log(JSON.stringify({
        level: 'info',
        message,
        ...context,
        ...meta,
        timestamp: new Date().toISOString(),
      }));
    },
    
    error: (message: string, error?: Error, meta?: any) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error?.message,
        stack: error?.stack,
        ...context,
        ...meta,
        timestamp: new Date().toISOString(),
      }));
    },
    
    warn: (message: string, meta?: any) => {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        ...context,
        ...meta,
        timestamp: new Date().toISOString(),
      }));
    },
  };
}

// 使用例
export async function GET(request: NextRequest) {
  const context: LogContext = {
    requestId: crypto.randomUUID(),
    ip: request.ip || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    path: request.nextUrl.pathname,
    method: request.method,
  };
  
  const logger = createLogger(context);
  
  try {
    logger.info('Processing request');
    const users = await getUsers();
    logger.info('Request completed successfully', { userCount: users.length });
    return createSuccessResponse(users);
  } catch (error) {
    logger.error('Request failed', error as Error);
    return handleApiError(error);
  }
}
```

## 10. テスト

### 10.1 API Routeのユニットテスト

```typescript
// __tests__/api/users.test.ts
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

describe('/api/users', () => {
  describe('GET', () => {
    test('ユーザー一覧を取得できる', async () => {
      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
  
  describe('POST', () => {
    test('新しいユーザーを作成できる', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };
      
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(userData.name);
    });
    
    test('無効なデータでバリデーションエラーが発生する', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }), // 無効なデータ
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
```

### 10.2 統合テスト

```typescript
// __tests__/integration/users.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/users/route';

describe('/api/users integration', () => {
  test('ユーザーのCRUD操作', async () => {
    // Create
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Integration Test User',
            email: 'integration@test.com',
          }),
        });
        
        expect(response.status).toBe(201);
      },
    });
  });
});
```

## 11. デプロイメント考慮事項

### 11.1 環境変数管理

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
});

export const env = envSchema.parse(process.env);
```

### 11.2 ヘルスチェックエンドポイント

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // データベース接続チェック
    await checkDatabaseConnection();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
```

## 12. 実装チェックリスト

### 12.1 必須実装
- [ ] 適切なHTTPメソッド関数名の使用
- [ ] 統一されたレスポンス形式
- [ ] 適切なHTTPステータスコード
- [ ] エラーハンドリング
- [ ] 入力値バリデーション

### 12.2 推奨実装
- [ ] 認証・認可
- [ ] レート制限
- [ ] ログ記録
- [ ] キャッシュ戦略
- [ ] CORS設定

### 12.3 高度な実装
- [ ] ストリーミングレスポンス
- [ ] レスポンス圧縮
- [ ] 詳細な監視
- [ ] パフォーマンス最適化
- [ ] セキュリティ強化

## 13. まとめ

Next.js API Routesを効果的に実装するには、フレームワークの規約に従い、セキュリティ、パフォーマンス、保守性を考慮した設計が重要です。これらのベストプラクティスに従うことで、スケーラブルで信頼性の高いAPIを構築できます。

段階的に実装し、プロジェクトの要件に応じて必要な機能を選択的に採用することが推奨されます。