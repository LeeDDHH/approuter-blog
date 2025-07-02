# プロジェクト構造説明

## 実行したコマンドの説明

### 1. プロジェクトファイルの削除
```bash
find . -type f -not -path "./.git/*" -not -name ".gitignore" -delete && find . -type d -empty -not -path "./.git/*" -delete
```
- `.git`ディレクトリと`.gitignore`ファイル以外のすべてのファイルとディレクトリを削除
- Gitの履歴は保持したまま、プロジェクトをクリーンな状態にリセット

### 2. Next.jsプロジェクトの初期化
```bash
npx create-next-app@latest . --app --typescript --tailwind --eslint --src-dir --import-alias "@/*" --use-npm
```

**各オプションの説明:**
- `--app`: App Routerを使用（新しいNext.js 13+のルーティングシステム）
- `--typescript`: TypeScriptサポートを有効化
- `--tailwind`: Tailwind CSSを自動設定
- `--eslint`: ESLintによるコード品質チェックを有効化
- `--src-dir`: `src/`ディレクトリ構造を採用
- `--import-alias "@/*"`: `@/`で`src/`ディレクトリを参照できるエイリアス設定
- `--use-npm`: パッケージマネージャーにnpmを使用
- Turbopack: 高速ビルドツール（開発時）を有効化

## プロジェクト構成

```
app-router-blog/
├── src/
│   └── app/
│       ├── globals.css      # グローバルスタイル（Tailwind含む）
│       ├── layout.tsx       # ルートレイアウト
│       └── page.tsx         # ホームページ
├── public/                  # 静的ファイル
├── next.config.js          # Next.js設定
├── tailwind.config.ts      # Tailwind CSS設定
├── tsconfig.json          # TypeScript設定
├── eslint.config.mjs      # ESLint設定
└── package.json           # 依存関係とスクリプト
```

**主要な特徴:**
- **App Router**: `src/app/`内でファイルベースルーティング
- **TypeScript**: 型安全性とIntelliSense
- **Tailwind CSS**: ユーティリティファーストのCSS
- **ESLint**: コード品質とスタイルの統一
- **Turbopack**: 従来のWebpackより高速な開発ビルド

## 開発コマンド

- `npm run dev` - Turbopackを使用した開発サーバーの起動（高速ビルド）
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - コード品質チェックのためのESLint実行