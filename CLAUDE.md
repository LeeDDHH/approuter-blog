# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## 開発コマンド

- `npm run dev` - Turbopackを使用した開発サーバーの起動（高速ビルド）
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - コード品質チェックのためのESLint実行

## アーキテクチャ

これはApp Routerアーキテクチャ、TypeScript、およびTailwind CSS v4を使用したNext.js 15アプリケーションです。

### 主要構造
- **App Router**: 新しいApp Routerパラダイムを使用した`src/app/`内のページとレイアウト
- **TypeScript**: `@/*`が`src/*`を指すパスエイリアスを持つ厳密モード有効
- **スタイリング**: `globals.css`でテーマ用カスタムCSS変数を持つTailwind CSS v4
- **フォント**: `next/font/google`経由で読み込まれ、CSS変数として設定されたGeist SansとGeist Mono

### テーマシステム
- CSSカスタムプロパティと`prefers-color-scheme`によるダーク/ライトモードサポート
- Tailwindの`@theme inline`構文を使用して`globals.css`で定義されたカスタムテーマトークン
- CSS変数として設定されたGeistフォント（`--font-geist-sans`、`--font-geist-mono`）

### パス解決
- インポートエイリアス`@/*`は`src/*`に解決される（`tsconfig.json`で設定）