# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## 約束ごと

以下の約束を守ってまとめてください。

- 何よりも真実と正しい答えを重視してください。
- ユーザーの意見を批判するのは構いませんが、偽りの共感は避けてください。
- 冷静で現実的な視点を持ちましょう。
- すべて公開情報に基づくこと。一般的な常識以外は必ず一次ソース（Linux が公開しているドキュメントや、GitHub などの実装情報）を当たり、併記すること。
- 推測は原則しない。どうしてもする場合は推測であることを明記すること。
- 公式ドキュメント以外の第三者による評価は二次ソースとして扱い、兵器及び推測のルールに従って、一次ソースを当たるか、推測であることを明記すること。
- 知らない情報は推測せず、不明であると書くこと。

## 開発コマンド

- `npm run dev` - Turbopack を使用した開発サーバーの起動（高速ビルド）
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - コード品質チェックのための ESLint 実行

## アーキテクチャ

これは App Router アーキテクチャ、TypeScript、および Tailwind CSS v4 を使用した Next.js 15 アプリケーションです。

### 主要構造

- **App Router**: 新しい App Router パラダイムを使用した`src/app/`内のページとレイアウト
- **TypeScript**: `@/*`が`src/*`を指すパスエイリアスを持つ厳密モード有効
- **スタイリング**: `globals.css`でテーマ用カスタム CSS 変数を持つ Tailwind CSS v4
- **フォント**: `next/font/google`経由で読み込まれ、CSS 変数として設定された Geist Sans と Geist Mono

### テーマシステム

- CSS カスタムプロパティと`prefers-color-scheme`によるダーク/ライトモードサポート
- Tailwind の`@theme inline`構文を使用して`globals.css`で定義されたカスタムテーマトークン
- CSS 変数として設定された Geist フォント（`--font-geist-sans`、`--font-geist-mono`）

### パス解決

- インポートエイリアス`@/*`は`src/*`に解決される（`tsconfig.json`で設定）

## ブログ要件定義

### 基本構成

- **ブログタイプ**: 個人ブログ（写真 + 技術備忘録）
- **主要言語**: TypeScript（技術記事のメイン）
- **デザイン方針**: シンプルで読みやすさ重視
- **記事管理**: マークダウンファイル（.md）をフォルダ保存で管理

### サイト構成

- **トップページ**: 最新記事一覧 + Bio（SNS リンク、ハンドルネーム、アイコン）
- **ナビゲーション**: ホーム、記事一覧、カテゴリ別、タグ一覧、プロフィール、お問い合わせ
- **カテゴリ**: 写真、技術、雑記、イベント（4 種類）
- **タグシステム**: TypeScript, React, Next.js, カメラ, 旅行などの分類機能

### 機能要件

- **コード表示**: 構文ハイライト（TypeScript メイン）、コピーボタン、ファイル名表示
- **記事機能**: タグ・カテゴリ分類、関連記事表示、前後記事ナビゲーション
- **検索機能**: サイト内記事検索
- **テーマ**: ダークモード・ライトモード切り替え
- **RSS 配信**: ブログ更新の RSS 配信
- **SEO 対策**: Google 検索上位表示を重視
- **パフォーマンス**: SSR 重視、高速表示を最優先（学習目的含む）

### 画像・デプロイ

- **画像管理**: 第一候補は Gist 保存、技術的に困難な場合はプロジェクト内フォルダ
- **デプロイ先**: CloudFlare Pages
- **ドメイン**: 独自ドメイン使用予定

### お問い合わせ・将来機能

- **お問い合わせ**: メールアドレス表示のみ（将来的にフォーム化も検討）
- **将来追加予定**: 記事推定読了時間表示、画像 before/after 表示機能

### 技術的優先事項

1. **SSR 最適化**: 静的サイト生成とサーバーサイドレンダリングの高速化
2. **SEO 最適化**: メタタグ、構造化データ、サイトマップの実装
3. **パフォーマンス**: 画像最適化、コード分割、キャッシュ戦略
4. **アクセシビリティ**: WCAG 準拠、スクリーンリーダー対応

## 外部リソース

### UI パーツ参考

- [UI elements: CSS & Tailwind](https://uiverse.io/elements)

### 全体的な UI の見た目の参考

- [Dribbble - Discover the World’s Top Designers & Creative Professionals](https://dribbble.com/)
- [Blog - Bionic Julia](https://bionicjulia.com/blog)
- [Blog - Allan Fernandes](https://www.allanfernandes.dev/blog)
