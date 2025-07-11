# CLAUDE_Q&A.md

このファイルは、ブログ要件定義のための問答記録です。

## 要件定義セッション記録

### 基本構成
**Q1-2**: ブログの種類と主なコンテンツは？
**A**: 個人ブログです、写真を載せたり、技術的な備忘録を載せたりする用途で考えています

### 写真・画像関連
**Q3**: 写真の扱いは記事に埋め込む形？それともギャラリーページのような独立した展示？
**A**: 写真は記事に埋め込む形です。PCとSPのサイズで見られることを想定しています。

**Q54**: 記事の写真はプロジェクト内のフォルダに保存で良いですか？
**A**: 画像はGistに保存することを想定しています。もしだめならプロジェクト内のフォルダに保存します

### 技術記事・コード表示
**Q11-12**: コード表示機能について
**A**: コードは表示する予定です。言語は今のところTypeScriptが多いです。

**Q19-20**: 構文ハイライトとコードブロック機能は？
**A**: 構文ハイライトはほしいですコードブロック機能も必要です

### 記事管理方法
**Q21**: 記事の書き方はマークダウンファイル vs ブラウザ管理画面？
**A**: マークダウンファイルを書いて、ファイルをフォルダに保存するほうが使いやすいです

### デザイン方向性
**Q22**: 見た目の好みはシンプル重視 vs 装飾重視？
**A**: シンプルで読みやすさ重視です。

### サイト構成
**Q26**: トップページは最新記事一覧で良いか？
**A**: トップページは最新記事一覧と自分のBioを表示するところがほしいです。

**Q27**: 記事分類機能は？
**A**: 記事にタグ、カテゴリ機能は必要です

**Q28**: 記事詳細ページのナビゲーションは？
**A**: 関連記事、前後の記事のナビゲーションはほしいです

**Q35**: ナビゲーションメニューの構成は？
**A**: ナビゲーションメニューにはホーム、記事一覧、カテゴリ別、タグ一覧、プロフィール、お問い合わせがほしいです

**Q36**: Bio（自己紹介）の詳細は？
**A**: トップページのBioはSNSのリンク、ハンドルネーム、アイコンが載せられるようにしたいです

### カテゴリ・タグ
**Q43**: カテゴリの詳細は？
**A**: カテゴリは写真、技術、雑記、イベントの4種類を想定しています。

**Q44**: タグの例は？
**A**: タグはTypeScript, React, Next.js, カメラ, 旅行などを考えています

### 機能要件
**Q51**: 検索機能は必要？
**A**: 検索機能はほしいです。

**Q52**: ダークモード機能は？
**A**: ダークモードも必要です。

**Q53**: RSS配信は？
**A**: RSS配信も必要です

### デプロイ・技術環境
**Q60**: デプロイ先は？
**A**: デプロイ先はCloudFlareを想定しています。

**Q61**: 独自ドメインは？
**A**: 独自ドメインは持っています

### パフォーマンス・SEO
**Q62**: 表示速度への重要度は？
**A**: 表示速度はかなり重要にしたいです。理由としてはSSRでのページ生成や個人の勉強も兼ねるためです

**Q69**: SEO対策の重要度は？
**A**: そうですねGoogle検索での上位表示も重視します

### お問い合わせ・将来機能
**Q70**: お問い合わせページの形式は？
**A**: お問い合わせはメールアドレス表示のみにします。将来、フォーム形式にする可能性はあります。

**Q71**: 将来的に追加したい機能は？
**A**: 将来的には記事の推定読了時間を表示するのと、画像のbefore・afterを表示する機能を考えています。

## 要件定義結果サマリー

### 確定した要件
- **ブログタイプ**: 個人ブログ（写真 + 技術備忘録）
- **記事管理**: マークダウンファイル管理
- **デザイン**: シンプル・読みやすさ重視
- **パフォーマンス**: SSR・高速表示を最優先
- **SEO**: Google検索上位表示を重視
- **画像**: Gist保存（技術的に困難な場合はローカル）
- **デプロイ**: CloudFlare Pages + 独自ドメイン

### 主要機能
- 構文ハイライト付きコード表示（TypeScript重視）
- カテゴリ・タグ分類システム
- 検索機能
- ダークモード
- RSS配信
- 関連記事・前後記事ナビゲーション

### 将来機能
- 記事推定読了時間表示
- 画像before/after表示機能
- お問い合わせフォーム化