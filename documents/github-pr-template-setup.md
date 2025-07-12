# GitHub PRテンプレート設定ガイド

## 概要

本プロジェクトにGitHub Pull Requestテンプレートを追加し、GitHub Copilotによるコードレビューを効果的に活用できるように設定しました。

## 実装内容

### ファイル構成

```
.github/
└── PULL_REQUEST_TEMPLATE.md
```

### テンプレートの特徴

#### 1. ブログプロジェクト特有の項目
- **記事関連の確認事項**
  - メタデータ（タイトル、日付、タグ、カテゴリ）の設定確認
  - 画像ファイルの適切な配置
  - マークダウン構文の正確性
  - SEO対応の確認

#### 2. 技術スタック対応
- TypeScript + Next.js App Router特有の確認項目
- ダークモード・ライトモード両対応の表示確認
- パフォーマンスとSEOへの影響確認

#### 3. GitHub Copilotレビュー促進機能
- **専用セクション**: "GitHub Copilot レビュー依頼"
- **具体的な質問項目**:
  - コードの品質とTypeScriptベストプラクティス
  - Next.js App Routerの適切な使用方法
  - パフォーマンスとSEOへの影響
  - セキュリティ上の懸念事項

#### 4. 変更タイプの分類
- 🐛 バグ修正
- ✨ 新機能
- 📝 ブログ記事追加
- 🎨 UI/UXの改善
- ♻️ リファクタリング
- 📚 ドキュメント更新
- 🔧 設定変更
- 🚀 パフォーマンス改善
- 🔒 セキュリティ対応
- 🌐 SEO対応

## 使用方法

### PR作成時
1. GitHubでPRを作成すると、テンプレートが自動で適用される
2. 該当する項目にチェックを入れる
3. 概要と変更内容を記載する

### GitHub Copilotレビュー活用
1. PRテンプレートの「Copilot への質問」セクションを使用
2. `@github-copilot` でメンションしてレビューを依頼
3. 具体的な確認項目を指定してより効果的なレビューを受ける

## 期待される効果

### 1. レビュー品質の向上
- 統一されたチェック項目による漏れの防止
- ブログ特有の確認事項の標準化

### 2. Copilotレビューの効率化
- 明確な質問項目により、より具体的で有用なフィードバックを獲得
- 技術スタック特有の観点での自動レビュー

### 3. 開発効率の向上
- PR作成時の確認項目の標準化
- レビュープロセスの効率化

## メンテナンス

### 定期的な見直し
- プロジェクトの成長に合わせてテンプレートを更新
- 新しい技術導入時の確認項目追加
- Copilotの機能向上に合わせた質問項目の最適化

### カスタマイズ推奨
- プロジェクト固有の要件に応じた項目の追加・削除
- チーム内のワークフローに合わせた調整

## 参考資料

- [GitHub Pull Request Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- [GitHub Copilot in Pull Requests](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-githubcom)