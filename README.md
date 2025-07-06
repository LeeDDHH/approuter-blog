# App Router Blog

Next.js 15 の App Router を使用したモダンなブログアプリケーションです。TypeScript と Tailwind CSS v4 を使用した個人ブログ（写真 + 技術備忘録）です。

## 技術スタック

- **Next.js 15** - App Router
- **TypeScript** - 型安全性（厳密モード有効）
- **Tailwind CSS v4** - スタイリング（カスタムテーマ対応）
- **ESLint** - コード品質管理
- **Turbopack** - 高速開発ビルド
- **Geist Font** - Google Fonts 経由で読み込み

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

- `npm run dev` - 開発サーバーの起動（Turbopack 使用）
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - ESLint によるコード品質チェック

## プロジェクト構成

### 主要構造

- **App Router**: `src/app/`内のページとレイアウト
- **TypeScript**: `@/*`が`src/*`を指すパスエイリアス
- **スタイリング**: `globals.css`でテーマ用カスタム CSS 変数を持つ Tailwind CSS v4
- **フォント**: CSS 変数として設定された Geist Sans と Geist Mono

### テーマシステム

- CSS カスタムプロパティと`prefers-color-scheme`によるダーク/ライトモードサポート
- Tailwind の`@theme inline`構文を使用したカスタムテーマトークン

## ブログ機能

### 基本構成

- **ブログタイプ**: 個人ブログ（写真 + 技術備忘録）
- **記事管理**: マークダウンファイル（.md）をフォルダ保存で管理
- **カテゴリ**: 写真、技術、雑記、イベント（4 種類）
- **タグシステム**: TypeScript, React, Next.js, カメラ, 旅行などの分類機能

### 機能要件

- **コード表示**: 構文ハイライト（TypeScript メイン）、コピーボタン、ファイル名表示
- **記事機能**: タグ・カテゴリ分類、関連記事表示、前後記事ナビゲーション
- **検索機能**: サイト内記事検索
- **テーマ**: ダークモード・ライトモード切り替え
- **RSS 配信**: ブログ更新の RSS 配信
- **SEO 対策**: Google 検索上位表示を重視
- **パフォーマンス**: SSR 重視、高速表示を最優先

## 開発について

このプロジェクトは以下の設計原則に従っています：

- **App Router**: Next.js 15 の新しいルーティングシステム
- **src/ ディレクトリ構造**: コードの整理とメンテナンス性の向上
- **TypeScript**: 型安全性と IntelliSense
- **Tailwind CSS v4**: ユーティリティファーストのスタイリング
- **SSR 最適化**: 静的サイト生成とサーバーサイドレンダリングの高速化

## デプロイ

**デプロイ先**: CloudFlare Pages（予定）
**ドメイン**: 独自ドメイン使用予定

### 画像管理

- **第一候補**: Gist 保存
- **代替案**: プロジェクト内フォルダ

その他のデプロイ方法については、[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。

---

# その他考慮事項

- スタイリング
  - `emotion` が SSR 対応されるようになったら、
