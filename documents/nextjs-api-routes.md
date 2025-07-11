# Next.js API Routes 学習メモ

## 1. API Routesとは

API Routesは、Next.js内でサーバーサイドのAPIエンドポイントを作成できる機能です。従来のフロントエンドアプリケーションでは別途バックエンドサーバーが必要でしたが、Next.jsではフロントエンドとバックエンドを同じプロジェクト内で管理できます。

### 1.1 特徴
- **フルスタック開発**: フロントエンドとバックエンドを一つのプロジェクトで管理
- **サーバーサイド実行**: Node.js環境で実行され、ブラウザには含まれない
- **HTTPメソッド対応**: GET、POST、PUT、DELETE等のHTTPメソッドに対応
- **ファイルベースルーティング**: ファイル構造がそのままAPIエンドポイントになる

## 2. App Router でのAPI Routes

### 2.1 基本構造
App Routerでは、`app/api/`ディレクトリ内に`route.ts`ファイルを作成してAPIエンドポイントを定義します。

```
app/
├── api/
│   ├── users/
│   │   └── route.ts          # /api/users
│   ├── posts/
│   │   ├── route.ts          # /api/posts
│   │   └── [id]/
│   │       └── route.ts      # /api/posts/[id]
│   └── hello/
│       └── route.ts          # /api/hello
```

### 2.2 基本的な書き方
```typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello World' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ message: 'Data received', data: body });
}
```

## 3. HTTPメソッドの実装

### 3.1 GET リクエスト
```typescript
export async function GET(request: NextRequest) {
  // クエリパラメータの取得
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  return NextResponse.json({ 
    message: 'GET request received',
    query: query 
  });
}
```

### 3.2 POST リクエスト
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // データベースへの保存処理など
    // const result = await saveToDatabase(body);
    
    return NextResponse.json({ 
      message: 'Data created successfully',
      data: body 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### 3.3 PUT リクエスト
```typescript
export async function PUT(request: NextRequest) {
  const body = await request.json();
  
  // データの更新処理
  // const result = await updateDatabase(body);
  
  return NextResponse.json({ 
    message: 'Data updated successfully',
    data: body 
  });
}
```

### 3.4 DELETE リクエスト
```typescript
export async function DELETE(request: NextRequest) {
  // 削除処理
  // await deleteFromDatabase(id);
  
  return NextResponse.json({ 
    message: 'Data deleted successfully' 
  });
}
```

## 4. Dynamic Routing（動的ルーティング）

### 4.1 基本的な動的ルーティング
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  
  return NextResponse.json({ 
    message: `User ID: ${userId}` 
  });
}
```

### 4.2 Catch-all Routes（今回使用した方法）
```typescript
// app/api/posts-images/[...path]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // /api/posts-images/folder/subfolder/image.jpg
  // params.path = ['folder', 'subfolder', 'image.jpg']
  
  const filePath = params.path.join('/');
  
  return NextResponse.json({ 
    message: `File path: ${filePath}` 
  });
}
```

## 5. 実用的な使用例

### 5.1 ファイル配信（今回の実装）
```typescript
// app/api/posts-images/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
    const fileBuffer = await readFile(filePath);
    const mimeType = lookup(filePath) || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
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

### 5.2 フォームデータの処理
```typescript
// app/api/contact/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    
    // メール送信処理
    // await sendEmail({ name, email, message });
    
    return NextResponse.json({ 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

### 5.3 データベース操作
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/database';

export async function GET() {
  try {
    // const posts = await db.post.findMany();
    const posts = []; // 仮データ
    
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
    // const newPost = await db.post.create({
    //   data: { title, content }
    // });
    
    return NextResponse.json({ 
      message: 'Post created',
      // post: newPost 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

## 6. どんなときに使うか

### 6.1 よくある使用例

#### 6.1.1 外部API呼び出しの中継
```typescript
// app/api/weather/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  
  const response = await fetch(`https://api.weather.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
  const data = await response.json();
  
  return NextResponse.json(data);
}
```

**メリット**:
- APIキーをサーバーサイドで管理（クライアントに露出しない）
- CORS問題の回避
- レスポンスのフィルタリング・加工

#### 6.1.2 認証・認可
```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // 認証ロジック
  // const user = await authenticateUser(email, password);
  
  if (user) {
    // JWTトークンの生成
    // const token = generateJWT(user);
    
    return NextResponse.json({ 
      message: 'Login successful',
      token: 'dummy-token'
    });
  } else {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
```

#### 6.1.3 ファイルアップロード
```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ファイル保存処理
    // await saveFile(buffer, file.name);
    
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      filename: file.name 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### 6.1.4 Webhook処理
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  // Stripeからのwebhookの検証
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  
  // イベントタイプに応じた処理
  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     // 支払い成功時の処理
  //     break;
  // }
  
  return NextResponse.json({ received: true });
}
```

### 6.2 使用を検討すべき場面

1. **外部APIの呼び出し**: APIキーを隠したい、CORS問題を回避したい
2. **データベース操作**: サーバーサイドでのデータ処理
3. **認証・認可**: セキュアな認証ロジック
4. **ファイル処理**: アップロード、ダウンロード、変換
5. **Webhook処理**: 外部サービスからのコールバック処理
6. **サーバーサイド計算**: 重い処理をサーバーで実行
7. **メール送信**: サーバーサイドからのメール送信

## 7. セキュリティとベストプラクティス

### 7.1 セキュリティ対策

#### 7.1.1 入力値の検証
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    // 検証済みデータを使用
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

#### 7.1.2 認証チェック
```typescript
function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  // JWT検証ロジック
  // return verifyJWT(token);
  return { id: '1', email: 'user@example.com' };
}

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ user });
}
```

#### 7.1.3 CORS設定
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ message: 'Hello' });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

### 7.2 エラーハンドリング
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // メイン処理
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 7.3 レスポンスの統一
```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

function createResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

function createErrorResponse(error: string, status: number = 500): NextResponse {
  return NextResponse.json({
    success: false,
    error
  }, { status });
}
```

## 8. フロントエンドからの呼び出し

### 8.1 fetch API
```typescript
// GET リクエスト
const response = await fetch('/api/posts');
const data = await response.json();

// POST リクエスト
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: 'New Post', content: 'Content' }),
});
```

### 8.2 SWR使用例
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function PostList() {
  const { data, error, isLoading } = useSWR('/api/posts', fetcher);
  
  if (error) return <div>Error loading posts</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data.posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 9. まとめ

API Routesは、Next.jsでフルスタックアプリケーションを構築する際の重要な機能です。サーバーサイドでのデータ処理、外部API呼び出し、認証、ファイル処理など、様々な用途に活用できます。

### 主な利点
- **一体化された開発**: フロントエンドとバックエンドを同じプロジェクトで管理
- **簡単な実装**: ファイルベースルーティングによる直感的な設計
- **セキュリティ**: サーバーサイドでの機密情報管理
- **パフォーマンス**: Next.jsの最適化機能を活用

適切にAPI Routesを活用することで、より効率的で安全なWebアプリケーションを構築できます。