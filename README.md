# App Router Blog

Next.js 15のApp Routerを使用したモダンなブログアプリケーションです。

## 技術スタック

- **Next.js 15** - App Router
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **ESLint** - コード品質管理
- **Turbopack** - 高速開発ビルド

## 開発環境のセットアップ

1. 依存関係のインストール:
   ```bash
   npm install
   ```

2. 開発サーバーの起動:
   ```bash
   npm run dev
   ```

3. ブラウザで http://localhost:3000 を開く

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動（Turbopack使用）
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - ESLintによるコード品質チェック

## プロジェクト構成

プロジェクトの詳細な構成については、[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)を参照してください。

## 開発について

このプロジェクトは以下の設計原則に従っています：

- **App Router**: Next.js 13+の新しいルーティングシステム
- **src/ ディレクトリ構造**: コードの整理とメンテナンス性の向上
- **TypeScript**: 型安全性とIntelliSense
- **Tailwind CSS**: ユーティリティファーストのスタイリング

## デプロイ

Vercelでのデプロイが推奨されています：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

その他のデプロイ方法については、[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。
