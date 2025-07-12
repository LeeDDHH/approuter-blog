# Storybook Build Error Resolution

## 問題概要

`npm run build-storybook`コマンド実行時に以下のエラーが発生しました：

```
Cannot add property 0, object is not extensible
    at Array.push (<anonymous>)
    at ConditionalExpression.getLiteralValueAtPath
```

## エラーの詳細

- **発生条件**: Storybook 9.x系とVite 7.xの組み合わせ
- **エラータイプ**: Rollupの内部処理でのオブジェクト拡張性エラー
- **影響範囲**: Storybookの本番ビルド（開発サーバーは正常動作）

## 根本原因

Rollupのtree-shaking処理中に、内部で使用されるオブジェクトが拡張不可能（non-extensible）な状態になり、配列への要素追加が失敗することが原因。これはStorybook 9.x系とVite 7.xの依存関係の互換性問題によるもの。

## 解決方法

### 実装した解決策

`.storybook/main.ts`にて、`viteFinal`設定でRollupのtree-shakingを無効化：

```typescript
viteFinal: async (config) => {
  // Disable tree-shaking completely to avoid the extensibility error
  if (config.build) {
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      treeshake: false,
    };
  }
  
  return config;
},
```

### 試行した他の解決策

1. **tree-shaking詳細設定**: `propertyReadSideEffects: false`等の設定 → 効果なし
2. **警告抑制設定**: `onwarn`での警告フィルタリング → 効果なし
3. **外部モジュール除外**: `external`設定によるモジュール除外 → 効果なし

## 結果

- ✅ Storybookのビルドが正常に完了
- ✅ 出力ファイルが`storybook-static`ディレクトリに生成
- ⚠️ 警告メッセージ: `**/*.mdx`パターンのストーリーファイルが見つからない（機能に影響なし）
- ⚠️ 500KB超のチャンクサイズ警告（機能に影響なし）

## 影響とトレードオフ

### メリット
- Storybookビルドが正常に動作する
- 既存のStorybook機能は全て利用可能

### デメリット
- tree-shakingが無効化されるため、バンドルサイズが増加する可能性
- ビルド時間が若干長くなる可能性

### トレードオフの妥当性
開発ツールであるStorybookにおいて、バンドルサイズの最適化よりもビルドの安定性を優先することは妥当。本番アプリケーションには影響しない。

## 今後の対応

### 短期的対応
- 現在の設定で運用継続
- 定期的な依存関係の更新時に問題が解決されているか確認

### 長期的対応
- Storybook 10.x系へのアップグレード時に設定の見直し
- Viteの新バージョンでの互換性改善を待つ
- 必要に応じてWebpack版Storybookへの移行を検討

## 参考情報

- **環境**: Storybook v9.0.16, Vite v7.0.4
- **フレームワーク**: @storybook/nextjs-vite
- **発生日**: 2025-07-12
- **解決にかかった時間**: 約30分