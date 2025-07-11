# API Routes 本番環境での使用に関する考慮事項

## 1. 概要

API Routesを本番環境でも使用する場合の実装方法、パフォーマンス最適化、セキュリティ対策、監視方法について説明します。

## 2. 実装パターンの比較

### 2.1 静的ファイル配信 vs API Routes

| 項目 | 静的ファイル配信 | API Routes |
|------|------------------|------------|
| パフォーマンス | 高速（CDN活用可） | 中程度（サーバー処理） |
| キャッシュ | ブラウザ・CDN | 手動実装 |
| 動的処理 | 不可 | 可能 |
| アクセス制御 | 基本的 | 高度 |
| ログ記録 | 限定的 | 詳細 |
| スケーラビリティ | 高い | サーバー依存 |

### 2.2 統一実装パターン

```typescript
// utilities.ts - 環境に関係なく統一されたパス
function rehypeImagePath() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img' && node.properties?.src?.startsWith('./images/')) {
        // 開発・本番ともに API Route を使用
        node.properties.src = node.properties.src.replace('./images/', '/api/posts-images/');
      }
    });
  };
}
```

## 3. パフォーマンス最適化

### 3.1 キャッシュ戦略

#### 3.1.1 HTTP キャッシュヘッダー
```typescript
// app/api/posts-images/[...path]/route.ts
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
  const stats = await stat(filePath);
  const fileBuffer = await readFile(filePath);
  
  // 強力なキャッシュ設定
  const headers = new Headers();
  headers.set('Content-Type', lookup(filePath) || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
  headers.set('Last-Modified', stats.mtime.toUTCString());
  
  // 条件付きリクエストの処理
  const ifNoneMatch = request.headers.get('if-none-match');
  const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
  
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }
  
  return new NextResponse(fileBuffer, { headers });
}
```

#### 3.1.2 インメモリキャッシュ
```typescript
// キャッシュストア
const imageCache = new Map<string, { buffer: Buffer; mtime: Date; mimeType: string }>();
const CACHE_MAX_SIZE = 100; // キャッシュする画像数の上限

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
  const cacheKey = params.path.join('/');
  
  try {
    const stats = await stat(filePath);
    const cached = imageCache.get(cacheKey);
    
    // キャッシュが有効な場合
    if (cached && cached.mtime.getTime() === stats.mtime.getTime()) {
      return new NextResponse(cached.buffer, {
        headers: {
          'Content-Type': cached.mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
        },
      });
    }
    
    // ファイルを読み込み
    const fileBuffer = await readFile(filePath);
    const mimeType = lookup(filePath) || 'application/octet-stream';
    
    // キャッシュサイズ制限
    if (imageCache.size >= CACHE_MAX_SIZE) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    
    // キャッシュに保存
    imageCache.set(cacheKey, {
      buffer: fileBuffer,
      mtime: stats.mtime,
      mimeType,
    });
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Image serving error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
```

### 3.2 画像最適化

#### 3.2.1 動的リサイズ
```typescript
import sharp from 'sharp';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : null;
  const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : null;
  const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : 80;
  
  const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
  const fileBuffer = await readFile(filePath);
  
  let processedBuffer = fileBuffer;
  
  // 画像処理が必要な場合
  if (width || height || quality !== 80) {
    const transformer = sharp(fileBuffer);
    
    if (width || height) {
      transformer.resize(width, height, { fit: 'inside', withoutEnlargement: true });
    }
    
    // フォーマット最適化
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      transformer.jpeg({ quality });
    } else if (ext === '.png') {
      transformer.png({ quality });
    } else if (ext === '.webp') {
      transformer.webp({ quality });
    }
    
    processedBuffer = await transformer.toBuffer();
  }
  
  return new NextResponse(processedBuffer, {
    headers: {
      'Content-Type': lookup(filePath) || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

#### 3.2.2 WebP変換
```typescript
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const acceptHeader = request.headers.get('accept') || '';
  const supportsWebP = acceptHeader.includes('image/webp');
  
  const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
  const fileBuffer = await readFile(filePath);
  
  if (supportsWebP && !filePath.endsWith('.webp')) {
    // WebP変換
    const webpBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();
    
    return new NextResponse(webpBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept',
      },
    });
  }
  
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': lookup(filePath) || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

## 4. セキュリティ対策

### 4.1 Path Traversal 対策
```typescript
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // パスの正規化と検証
  const normalizedPath = path.normalize(params.path.join('/'));
  
  // 危険なパスパターンの検出
  if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  
  const filePath = path.join(process.cwd(), 'posts', 'images', normalizedPath);
  const postsImagesDir = path.resolve(process.cwd(), 'posts', 'images');
  
  // posts/images配下かチェック
  if (!path.resolve(filePath).startsWith(postsImagesDir)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // 以下、通常の処理
}
```

### 4.2 レート制限
```typescript
// 簡易的なレート制限実装
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // 1時間あたりのリクエスト数
const RATE_WINDOW = 60 * 60 * 1000; // 1時間

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    );
  }
  
  // 通常の処理
}
```

### 4.3 アクセス制御
```typescript
// 認証が必要な画像の例
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const imagePath = params.path.join('/');
  
  // プライベート画像の場合は認証チェック
  if (imagePath.startsWith('private/')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token || !await verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // 通常の画像配信処理
}
```

## 5. 監視とログ

### 5.1 詳細なアクセスログ
```typescript
interface ImageAccessLog {
  timestamp: string;
  ip: string;
  userAgent: string;
  path: string;
  status: number;
  responseTime: number;
  cacheHit: boolean;
  fileSize: number;
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const startTime = Date.now();
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const imagePath = params.path.join('/');
  
  try {
    // 画像処理
    const result = await processImage(imagePath);
    
    // アクセスログ記録
    const log: ImageAccessLog = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      path: imagePath,
      status: 200,
      responseTime: Date.now() - startTime,
      cacheHit: result.fromCache,
      fileSize: result.buffer.length,
    };
    
    console.log('Image access:', JSON.stringify(log));
    
    return new NextResponse(result.buffer, {
      headers: result.headers,
    });
  } catch (error) {
    // エラーログ記録
    const errorLog = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      path: imagePath,
      status: 404,
      responseTime: Date.now() - startTime,
      error: error.message,
    };
    
    console.error('Image access error:', JSON.stringify(errorLog));
    
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
```

### 5.2 メトリクス収集
```typescript
// 基本的なメトリクス
const metrics = {
  requestCount: 0,
  errorCount: 0,
  cacheHitCount: 0,
  totalResponseTime: 0,
  averageFileSize: 0,
};

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const startTime = Date.now();
  metrics.requestCount++;
  
  try {
    // 画像処理
    const result = await processImage(params.path.join('/'));
    
    if (result.fromCache) {
      metrics.cacheHitCount++;
    }
    
    metrics.totalResponseTime += Date.now() - startTime;
    metrics.averageFileSize = (metrics.averageFileSize + result.buffer.length) / 2;
    
    return new NextResponse(result.buffer, { headers: result.headers });
  } catch (error) {
    metrics.errorCount++;
    throw error;
  }
}

// メトリクス出力API
export async function GET() {
  const avgResponseTime = metrics.totalResponseTime / metrics.requestCount;
  const cacheHitRate = (metrics.cacheHitCount / metrics.requestCount) * 100;
  const errorRate = (metrics.errorCount / metrics.requestCount) * 100;
  
  return NextResponse.json({
    requestCount: metrics.requestCount,
    errorRate: `${errorRate.toFixed(2)}%`,
    cacheHitRate: `${cacheHitRate.toFixed(2)}%`,
    avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
    avgFileSize: `${(metrics.averageFileSize / 1024).toFixed(2)}KB`,
  });
}
```

## 6. デプロイメント考慮事項

### 6.1 Vercel での最適化
```typescript
// vercel.json
{
  "functions": {
    "app/api/posts-images/[...path]/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/posts-images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 6.2 メモリ使用量の監視
```typescript
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const memoryBefore = process.memoryUsage();
  
  try {
    // 画像処理
    const result = await processImage(params.path.join('/'));
    
    const memoryAfter = process.memoryUsage();
    const memoryDiff = memoryAfter.heapUsed - memoryBefore.heapUsed;
    
    // メモリ使用量が多い場合は警告
    if (memoryDiff > 50 * 1024 * 1024) { // 50MB
      console.warn('High memory usage detected:', {
        path: params.path.join('/'),
        memoryDiff: `${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
      });
    }
    
    return new NextResponse(result.buffer, { headers: result.headers });
  } catch (error) {
    throw error;
  }
}
```

## 7. パフォーマンス最適化のベストプラクティス

### 7.1 ファイルサイズ制限
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
  const stats = await stat(filePath);
  
  if (stats.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File too large' },
      { status: 413 }
    );
  }
  
  // 通常の処理
}
```

### 7.2 並行処理制限
```typescript
// 並行処理数の制限
const processingQueue = new Map<string, Promise<NextResponse>>();

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const imagePath = params.path.join('/');
  
  // 同じ画像の処理が進行中の場合は待機
  if (processingQueue.has(imagePath)) {
    return await processingQueue.get(imagePath)!;
  }
  
  // 処理を開始
  const processingPromise = processImageRequest(imagePath);
  processingQueue.set(imagePath, processingPromise);
  
  try {
    const result = await processingPromise;
    return result;
  } finally {
    processingQueue.delete(imagePath);
  }
}
```

## 8. 実装チェックリスト

### 8.1 必須実装
- [ ] 適切なキャッシュヘッダーの設定
- [ ] Path Traversal対策
- [ ] エラーハンドリング
- [ ] MIMEタイプの正確な設定
- [ ] ファイルサイズ制限

### 8.2 推奨実装
- [ ] レート制限
- [ ] 詳細なアクセスログ
- [ ] メトリクス収集
- [ ] インメモリキャッシュ
- [ ] 条件付きリクエスト対応

### 8.3 高度な実装
- [ ] 動的画像リサイズ
- [ ] WebP変換
- [ ] 認証・認可
- [ ] 並行処理制限
- [ ] メモリ使用量監視

## 9. 本番環境での注意事項

### 9.1 CDN との併用
```typescript
// CDN経由でのキャッシュ最適化
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const response = await processImage(params.path.join('/'));
  
  // CDN用のヘッダー設定
  response.headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000');
  response.headers.set('Vary', 'Accept');
  
  return response;
}
```

### 9.2 スケーラビリティ
- **水平スケーリング**: 複数のインスタンス間でのキャッシュ共有
- **ロードバランシング**: 画像処理の負荷分散
- **外部ストレージ**: 大量の画像ファイルの管理

### 9.3 監視項目
- レスポンス時間
- エラー率
- キャッシュヒット率
- メモリ使用量
- ファイルシステムの使用量

## 10. まとめ

API Routesを本番環境で使用する場合は、パフォーマンス、セキュリティ、監視の3つの観点から適切な実装を行うことが重要です。静的ファイル配信と比較して処理負荷は高くなりますが、動的な画像処理や高度なアクセス制御が可能になります。

プロジェクトの要件に応じて、必要な機能を選択的に実装することで、効果的な画像配信システムを構築できます。