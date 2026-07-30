---
description: 対応するAIクライアントをMinivizへ接続し、参照を許可するprojectを選択する手順です。
---

# Miniviz MCPを接続する

Miniviz MCPは、対応するAIクライアントと、あなたが選んだMiniviz projectを連携する仕組みです。AIに自然言語で質問しながら、projectのデータをread-onlyで分析できます。
以下では、Codexを例に接続手順を説明します。

## MCPでできること

接続後は、自然言語で次のことを行えます。

- 最新値を確認する
- 推移を分析する
- 条件に一致するevent件数を集計する
- chartや監視ruleの内容を確認する
- 公式Miniviz Docsを検索する

質問に応じてAIが適切なMiniviz Toolを選ぶため、Tool名やクエリの書き方を覚える必要はありません。

Miniviz MCPは次の操作を行いません。

- データの送信、変更、削除
- chartやruleの変更
- 通知の実行
- tokenやcredentialなど秘密情報の取得

参照できるのは、接続時に選択したprojectだけです。

:::tip Public Beta

Miniviz MCPは現在Public Betaです。対応クライアントや仕様は、改善に伴って変更される場合があります。

:::

## 接続までのフロー

1. Minivizの**AI連携**画面でServer URLをコピーする。
2. AIクライアントに、コピーしたURLをRemote MCPサーバーまたはコネクタとして追加する。
3. 接続を開始し、認可画面からMinivizへログインする。
4. クライアントに参照を許可するprojectを選択して、接続を許可する。
5. 新しい会話に戻り、選択したprojectだけを一覧できることを確認する。

接続済みクライアント、参照可能なproject、接続解除はMinivizの**AI連携**画面から確認・操作できます。

## 動作確認済みクライアント

**ChatGPTのDeveloper mode**で動作確認済みです。

- 認可方式: predefined OAuth client
- 確認範囲: 接続、Minivizログイン、project選択、read-only Tool認識、project参照、接続解除・revoke

**Codex**でも動作確認済みです。

- 確認範囲: MCPサーバー登録、OAuth認可、project選択、許可projectの確認、接続解除

ほかのクライアントについては、動作確認済みとして列挙していません。接続には次の対応が必要です。

- HTTPSのRemote MCPサーバー
- OAuth認可

設定画面や項目名はクライアントごとに異なります。

## 1. MinivizでAI連携画面を開く

1. Minivizへログインする。
2. アプリのナビゲーションから**AI連携**を開く。
3. read-onlyの注意事項を確認し、表示された**Server URL**をコピーする。

対応クライアントに入力するMinivizの接続情報は、このURLだけです。tokenやcredentialを設定画面へ貼り付けないでください。

<div className="mcp-screenshot">

![MinivizのAI連携画面でServer URLをコピーする](../../../../../static/images/mcp/01-ai-connections-server-url.png)

</div>

## 2. AIクライアントへMinivizを登録する

1. Codexの設定で**Plugins**を開き、**MCPs**タブを選択する。
2. **Add server**を選択する。

<div className="mcp-screenshot">

![CodexのPlugins画面でMCPサーバーを追加する](../../../../../static/images/mcp/02-codex-mcp-add-server.png)

</div>

3. 名前を入力し、Typeで**Streamable HTTP**を選択する。
4. MinivizからコピーしたServer URLを貼り付ける。
5. Bearer tokenやHeadersは入力せず、**Save**を選択する。

<div className="mcp-screenshot">

![CodexへMiniviz MCPサーバーを登録する](../../../../../static/images/mcp/03-codex-mcp-server-configuration.png)

</div>

6. 一覧に追加されたMinivizで**Authenticate**を選択し、認可を開始する。

<div className="mcp-screenshot">

![CodexでMiniviz MCPの認可を開始する](../../../../../static/images/mcp/04-codex-mcp-authentication.png)

</div>

他のクライアントでは画面上の名称や手順が異なりますが、Remote MCPサーバーの追加、Server URLの入力、OAuth認可という流れは同じです。

## 3. ログインして参照projectを選ぶ

1. 求められたらMinivizへログインする。
2. Minivizの同意画面で、クライアントに参照を許可するprojectだけを選択する。
3. 接続を許可し、AIクライアントへ戻る。

このクライアントは、ここで選択したprojectだけを参照できます。選択を変えたい場合は、再接続して選び直せます。

<div className="mcp-screenshot">

![Minivizの同意画面で参照を許可するprojectを選ぶ](../../../../../static/images/mcp/05-miniviz-project-consent.png)

</div>

## 4. Codexで接続を確認する

Codexで新しい会話を開き、次のように質問します。

```text
この接続で許可されているMiniviz projectを一覧にして。
```

選択したprojectだけが返れば接続完了です。続けて[Miniviz MCP活用Tips](./tips)の質問例を試してください。

<div className="mcp-screenshot">

![Codexで許可済みMiniviz projectを確認する](../../../../../static/images/mcp/07-codex-permitted-projects.png)

</div>

## 接続状況の確認と解除

Minivizの**AI連携**画面では、接続済みクライアントと各クライアントが参照できるprojectを確認できます。**接続解除**を選ぶと、Minivizの参照権限とOAuth認可を解除します。解除したクライアントが再びデータを読むには、もう一度認可が必要です。

<div className="mcp-screenshot">

![MinivizのAI連携画面で接続済みクライアントを確認または解除する](../../../../../static/images/mcp/06-ai-connections-connected-client.png)

</div>

## 接続できない場合

- Server URLをMinivizからコピーし、変更せずに貼り付けたか確認する。
- 利用中のクライアントがRemote MCPサーバーとOAuth認可に対応しているか確認する。
- 認可後は新しい会話から試す。
- クライアントが一覧にあるのにデータを読めない場合は、Minivizで接続解除してから再接続する。
