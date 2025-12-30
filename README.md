# miniviz-docs

Minivizのドキュメントです。
https://docs.miniviz.net/

## ローカルでの実行方法

### 前提条件

- Ruby 3.3.0以上
- Bundler
- rbenv（推奨）

### セットアップ手順

#### 1. rbenvとRubyのインストール（未インストールの場合）

```bash
# Homebrewでrbenvをインストール
brew install rbenv ruby-build

# rbenvを初期化（~/.zshrcまたは~/.bash_profileに追加）
eval "$(rbenv init - zsh)"

# Ruby 3.3.0をインストール
rbenv install 3.3.0
```

#### 2. プロジェクトのセットアップ

```bash
# プロジェクトディレクトリに移動
cd docs/miniviz-docs

# rbenvでRuby 3.3.0を使用するように設定
eval "$(rbenv init - zsh)"
rbenv local 3.3.0

# 依存関係をインストール
bundle install
```

#### 3. SSL検証エラーの回避（必要な場合）

リモートテーマのダウンロード時にSSL証明書の検証エラーが発生する場合があります。
その場合は、`jekyll-remote-theme`のダウンローダーを修正してSSL検証をスキップします：

```bash
# jekyll-remote-themeのダウンローダーファイルを編集
vi vendor/bundle/ruby/3.3.0/gems/jekyll-remote-theme-0.4.3/lib/jekyll-remote-theme/downloader.rb
```

42行目の`Net::HTTP.start`の行を以下のように修正：

```ruby
Net::HTTP.start(zip_url.host, zip_url.port, :use_ssl => true, :verify_mode => OpenSSL::SSL::VERIFY_NONE) do |http|
```

#### 4. Jekyllサーバーの起動

```bash
# ビルドとサーバー起動
bundle exec jekyll serve --source docs --destination _site --host 0.0.0.0
```

ブラウザで **http://localhost:4000** にアクセスしてドキュメントサイトを確認できます。

### トラブルシューティング

#### SSL証明書エラーが発生する場合

上記の手順3で`jekyll-remote-theme`のダウンローダーを修正してください。

#### 依存関係のインストールに失敗する場合

```bash
# Gemfile.lockを削除して再インストール
rm -f Gemfile.lock
rm -rf vendor/bundle
bundle install
```

#### ポート4000が既に使用されている場合

```bash
# 別のポートを指定
bundle exec jekyll serve --source docs --destination _site --host 0.0.0.0 --port 4001
```
