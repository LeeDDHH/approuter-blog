# posts配下での画像管理機能 仕様書

## 1. 概要

posts配下で画像を管理し、開発時と本番時で異なる画像配信方法を使い分ける機能です。マークダウンファイルと画像ファイルを同じディレクトリで管理し、環境に応じて最適な配信方法を自動選択します。

## 2. ディレクトリ構成

```
posts/
├── images/
│   ├── [記事名]/
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── ...
│   └── [記事名]/
│       └── ...
├── article1.md
├── article2.md
└── ...
```

## 3. 実装ファイル

### 3.1 API Route
**ファイル**: `src/app/api/posts-images/[...path]/route.ts`

**目的**: 開発時にposts/images配下の画像を直接配信

**機能**:
- Dynamic Routing (`[...path]`) でネストした画像パスに対応
- posts/images配下の画像ファイルを直接読み込み
- 適切なMIMEタイプ（image/jpeg、image/png等）を自動判定
- セキュリティ対策: posts/images配下以外へのアクセスを防止
- キャッシュヘッダー設定（1日キャッシュ）
- エラーハンドリング（404、403、500）

**主要処理**:
```typescript
const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);
```

### 3.2 Next.js Rewrites設定
**ファイル**: `next.config.ts`

**目的**: `/posts-images/*` へのリクエストをAPI Routeに転送

**設定**:
```typescript
async rewrites() {
  return [
    {
      source: '/posts-images/:path*',
      destination: '/api/posts-images/:path*',
    },
  ];
}
```

**機能**:
- URLの内部的な書き換え（ブラウザには`/posts-images/...`が表示）
- 実際の処理はAPI Routeで実行

### 3.3 画像コピースクリプト
**ファイル**: `scripts/copy-images.js`

**目的**: 本番ビルド時にposts/images配下の画像をpublic/imagesにコピー

**機能**:
- posts/images配下の全ファイルをpublic/imagesに再帰的にコピー
- 既存のpublic/images内容を事前にクリーンアップ
- ディレクトリ構造を保持
- コピー状況をコンソールに出力

**実行タイミング**:
- `npm run build` 時に自動実行
- `npm run copy-images` で手動実行可能

### 3.4 環境別画像パス変換
**ファイル**: `src/app/lib/utilities.ts`

**目的**: マークダウン内の画像パスを環境に応じて変換

**機能**:
- rehypeプラグイン `rehypeImagePath()` として実装
- 開発時: `./images/` → `/posts-images/` (API Route経由)
- 本番時: `./images/` → `/images/` (public配下の静的ファイル)
- unified/rehypeパイプラインに組み込み

**変換ロジック**:
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const basePath = isDevelopment ? '/posts-images/' : '/images/';
```

### 3.5 マークダウンファイルフィルタリング
**ファイル**: `src/app/lib/utilities.ts`

**目的**: posts配下の`.md`ファイルのみを処理対象にする

**対象関数**:
- `getAllPostsData()`
- `getPostData()`
- `getAllTags()`

**実装**:
```typescript
.filter((fileName) => fileName.endsWith('.md'))
```

### 3.6 パッケージ設定
**ファイル**: `package.json`

**追加スクリプト**:
```json
{
  "scripts": {
    "build": "node scripts/copy-images.js && next build",
    "copy-images": "node scripts/copy-images.js"
  }
}
```

**追加依存関係**:
```json
{
  "dependencies": {
    "mime-types": "^3.0.1",
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "@types/mime-types": "^3.0.1"
  }
}
```

## 4. 動作フロー

### 4.1 開発時 (`npm run dev`)

1. **マークダウン解析**: `![alt](./images/my-article/demo.jpg)`
2. **パス変換**: `rehypeImagePath` → `/posts-images/my-article/demo.jpg`
3. **URL書き換え**: Next.js rewrites → `/api/posts-images/my-article/demo.jpg`
4. **ファイル配信**: API Route → `posts/images/my-article/demo.jpg`

### 4.2 本番時 (`npm run build`)

1. **画像コピー**: `copy-images.js` → `posts/images/* → public/images/*`
2. **マークダウン解析**: `![alt](./images/my-article/demo.jpg)`
3. **パス変換**: `rehypeImagePath` → `/images/my-article/demo.jpg`
4. **静的配信**: Next.js → `public/images/my-article/demo.jpg`

## 5. 使用方法

### 5.1 画像配置
```
posts/
├── images/
│   └── my-first-blog-article/
│       ├── intro.jpg
│       └── demo.png
└── my-first-blog-article.md
```

### 5.2 マークダウンでの画像指定
```markdown
![説明文](./images/my-first-blog-article/intro.jpg)
![デモ画像](./images/my-first-blog-article/demo.png)
```

### 5.3 開発コマンド
```bash
# 開発サーバー起動（画像コピー不要）
npm run dev

# 本番ビルド（画像を自動コピー）
npm run build

# 画像のみコピー（手動実行）
npm run copy-images
```

## 6. 技術仕様

### 6.1 サポート画像形式
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- SVG (.svg)
- その他（mime-typesライブラリで判定）

### 6.2 セキュリティ対策
- Path Traversal攻撃防止
- posts/images配下以外へのアクセス拒否
- 適切なHTTPステータスコード返却

### 6.3 パフォーマンス最適化
- 開発時: API Route経由で直接配信
- 本番時: 静的ファイル配信
- キャッシュヘッダー設定（1日キャッシュ）
- 適切なContent-Lengthヘッダー設定

## 7. メリット

1. **開発効率向上**: 開発時は画像コピー不要で即座に反映
2. **本番最適化**: 静的ファイル配信による高速化
3. **一元管理**: 記事と画像を同じディレクトリで管理
4. **セキュリティ**: 適切なアクセス制御
5. **保守性**: 環境別の処理が自動化

## 8. 注意事項

### 8.1 画像パス指定
- 必ず `./images/` で始まるパスを使用
- 絶対パスや外部URLは変換対象外

### 8.2 ディレクトリ構成
- posts/images配下は記事名でディレクトリ分割を推奨
- 同名ファイルの競合を避けるため

### 8.3 ビルド時の注意
- 本番ビルド前に画像が自動コピーされる
- public/images配下の既存ファイルは削除される

## 9. トラブルシューティング

### 9.1 画像が表示されない
- posts/images配下にファイルが存在するか確認
- マークダウンのパス指定が正しいか確認
- 開発サーバーの再起動を試行

### 9.2 EISDIR エラー
- posts配下に`.md`以外のファイル・フォルダが存在する場合
- フィルタリング処理により解決済み

### 9.3 403 Forbidden エラー
- posts/images配下以外のファイルへのアクセス
- セキュリティ対策による正常な動作