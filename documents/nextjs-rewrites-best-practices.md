# Next.js Rewrites を使った画像パス設計のベストプラクティス

## 1. 問題の概要

API Routesで画像配信を行う際、マークダウン処理でパスを直接 `/api/posts-images/` に指定するか、`/posts-images/` にしてrewritesで転送するかという設計選択について。

## 2. 2つのアプローチの比較

### 2.1 直接API Routeを指定する場合

```typescript
// utilities.ts
function rehypeImagePath() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img' && node.properties?.src?.startsWith('./images/')) {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const basePath = isDevelopment ? '/api/posts-images/' : '/images/';
        node.properties.src = node.properties.src.replace('./images/', basePath);
      }
    });
  };
}
```

**結果**:
- 開発時: `/api/posts-images/my-article/image.jpg`
- 本番時: `/images/my-article/image.jpg`

### 2.2 Rewrites を使用する場合

```typescript
// utilities.ts
function rehypeImagePath() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img' && node.properties?.src?.startsWith('./images/')) {
        // 常に /posts-images/ に統一
        node.properties.src = node.properties.src.replace('./images/', '/posts-images/');
      }
    });
  };
}
```

```typescript
// next.config.ts
async rewrites() {
  const isDev = process.env.NODE_ENV === 'development';
  
  return [
    {
      source: '/posts-images/:path*',
      destination: isDev 
        ? '/api/posts-images/:path*'  // 開発時: API Route
        : '/images/:path*',           // 本番時: static files
    },
  ];
}
```

**結果**:
- 開発時: `/posts-images/my-article/image.jpg` → `/api/posts-images/my-article/image.jpg`
- 本番時: `/posts-images/my-article/image.jpg` → `/images/my-article/image.jpg`

## 3. 直接API Routeを指定する場合の問題点

### 3.1 URLの一貫性の欠如

```typescript
// 環境による大きなURL差異
// 開発時: /api/posts-images/my-article/image.jpg
// 本番時: /images/my-article/image.jpg
```

**問題**:
- デバッグ時の混乱
- テスト環境での再現性問題
- ドキュメントやログでの統一性欠如

### 3.2 API Routes の露出

```typescript
// /api/ パスが見えることで実装詳細が露出
// 攻撃者にAPI Routeの存在を知らせる
```

**セキュリティリスク**:
- API構造の推測が容易
- 他のAPI Routeへの攻撃の足がかり
- 意図しない API 呼び出しの可能性

### 3.3 将来の変更が困難

```typescript
// 実装変更時に複数箇所の修正が必要
// - utilities.ts のパス生成ロジック
// - フロントエンドのURL処理
// - 各種設定ファイル
```

**保守性の問題**:
- 変更時の影響範囲が広い
- 設定の分散による管理困難
- 機能拡張時の制約

## 4. Rewrites を使う利点

### 4.1 URLの抽象化

```typescript
// 常に統一されたクリーンなURL
// /posts-images/folder/image.jpg
// 
// 実装詳細（APIかstaticファイルか）を完全に隠蔽
```

**メリット**:
- 環境による差異なし
- 実装詳細の隠蔽
- ユーザーフレンドリーなURL

### 4.2 セキュリティ上のメリット

#### 4.2.1 API構造の隠蔽
```typescript
// 攻撃者にはAPI Routeの存在が分からない
// /posts-images/* が静的ファイルかAPIか判別困難
```

#### 4.2.2 統一されたアクセス制御
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/posts-images/')) {
    // 統一されたアクセス制御
    // - レート制限
    // - IP制限
    // - 認証チェック
    // - ログ記録
  }
}
```

#### 4.2.3 将来の拡張性
```typescript
// 認証が必要になった場合の例
async rewrites() {
  return [
    {
      source: '/posts-images/:path*',
      destination: '/api/auth/images/:path*',  // 認証付きAPI Routeに変更
    },
  ];
}
```

### 4.3 保守性の向上

#### 4.3.1 ルーティングの一元管理
```typescript
// next.config.ts でルーティングを一元管理
// utilities.ts では統一されたパス（/posts-images/）のみ意識
```

#### 4.3.2 設定の集約
```typescript
// 環境別の設定が next.config.ts に集約
// 他のファイルは環境を意識しない設計
```

#### 4.3.3 テストの容易性
```typescript
// 統一されたURLでのテスト
// 環境差異を考慮する必要がない
```

## 5. 実装例

### 5.1 推奨される実装

```typescript
// utilities.ts - 環境を意識しないクリーンな実装
function rehypeImagePath() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img' && node.properties?.src?.startsWith('./images/')) {
        // 常に /posts-images/ に統一
        node.properties.src = node.properties.src.replace('./images/', '/posts-images/');
      }
    });
  };
}
```

```typescript
// next.config.ts - 環境別のルーティング制御
const nextConfig: NextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/posts-images/:path*',
        destination: isDev 
          ? '/api/posts-images/:path*'  // 開発時: API Route
          : '/images/:path*',           // 本番時: static files
      },
    ];
  },
};
```

### 5.2 セキュリティ強化の例

```typescript
// middleware.ts - 統一されたアクセス制御
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/posts-images/')) {
    // レート制限
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // ログ記録
    logImageAccess(request);
    
    // 必要に応じて認証チェック
    // const authResult = checkAuthentication(request);
    // if (!authResult.success) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/posts-images/:path*',
};
```

### 5.3 将来の拡張例

```typescript
// 認証付き画像配信への拡張
async rewrites() {
  return [
    {
      source: '/posts-images/private/:path*',
      destination: '/api/auth/images/:path*',  // 認証必須
    },
    {
      source: '/posts-images/public/:path*',
      destination: process.env.NODE_ENV === 'development'
        ? '/api/posts-images/:path*'
        : '/images/:path*',
    },
  ];
}
```

```typescript
// CDN配信への移行例
async rewrites() {
  if (process.env.USE_CDN === 'true') {
    // CDN使用時はrewriteなし（外部URL使用）
    return [];
  }
  
  return [
    {
      source: '/posts-images/:path*',
      destination: process.env.NODE_ENV === 'development'
        ? '/api/posts-images/:path*'
        : '/images/:path*',
    },
  ];
}
```

## 6. パフォーマンス考慮事項

### 6.1 キャッシュ戦略

```typescript
// API Route でのキャッシュ設定
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const response = new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
      'ETag': generateETag(fileBuffer),
    },
  });
  
  return response;
}
```

### 6.2 CDN との連携

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    // CDN使用時の設定
    if (process.env.CDN_ENABLED === 'true') {
      return [
        {
          source: '/posts-images/:path*',
          destination: `${process.env.CDN_URL}/images/:path*`,
        },
      ];
    }
    
    // 通常の設定
    return [
      {
        source: '/posts-images/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? '/api/posts-images/:path*'
          : '/images/:path*',
      },
    ];
  },
};
```

## 7. 監視とログ

### 7.1 アクセスログの統一

```typescript
// 統一されたログ形式
// [2024-01-15 10:30:45] GET /posts-images/my-article/image.jpg 200 1.2ms
// [2024-01-15 10:30:46] GET /posts-images/other-article/photo.png 200 0.8ms
```

### 7.2 エラー監視

```typescript
// middleware.ts でのエラー監視
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/posts-images/')) {
    try {
      // 処理
    } catch (error) {
      // 統一されたエラー処理
      console.error('Image access error:', {
        path: request.nextUrl.pathname,
        error: error.message,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
```

## 8. まとめ

### 8.1 Rewrites を使うべき理由

1. **URL設計の一貫性**: 環境による差異を排除
2. **セキュリティ強化**: API構造の隠蔽と統一されたアクセス制御
3. **保守性向上**: 設定の一元管理と将来の拡張性
4. **テスト容易性**: 統一されたURLでのテスト実行

### 8.2 推奨アーキテクチャ

```
マークダウン処理 → 統一されたURL (/posts-images/) → Rewrites → 環境別の実装
                                                   ↓
                                           開発時: API Route
                                           本番時: Static Files
```

### 8.3 実装時の注意点

1. **middleware.ts** での統一されたアクセス制御実装
2. **next.config.ts** での環境別ルーティング設定
3. **utilities.ts** では環境を意識しないクリーンな実装
4. **適切なキャッシュ戦略** の実装

Rewrites を使用することで、よりスケーラブルで保守性の高い画像配信システムを構築できます。