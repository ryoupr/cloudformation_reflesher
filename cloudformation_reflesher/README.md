# CloudFormation Refresher

AWS CloudFormationコンソールの更新ボタンを自動的にクリックする Chrome 拡張機能です。スタックの状態を定期的に確認する際に便利です。

## 機能

- AWS CloudFormationコンソールの更新ボタンを自動的にクリック
- カスタマイズ可能な更新間隔（最小1秒、デフォルト3秒）
- 簡単な開始/停止の切り替え
- 更新状態の視覚的フィードバック

## インストール方法

1. Google Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このリポジトリのフォルダを選択

## 使用方法

1. AWS CloudFormationコンソール画面にアクセス
2. Chrome右上の拡張機能アイコンをクリック
3. 更新間隔を設定（デフォルト3秒）
4. 「開始」ボタンをクリックして自動更新を開始
5. 「停止」ボタンをクリックして自動更新を停止

## ファイル構成

```
cloudformation_reflesher/
├── README.md         # このファイル
├── manifest.json     # 拡張機能の設定ファイル
├── popup.html       # ポップアップUI
├── popup.js        # ポップアップのロジック
└── content.js      # 自動更新の実行ロジック
```

## 注意事項

- この拡張機能はAWS CloudFormationコンソール（`https://*.console.aws.amazon.com/*cloudformation*`）でのみ動作します
- ブラウザのパフォーマンスに影響を与える可能性があるため、使用しない時は必ず停止してください
- 更新間隔を短くしすぎると、ブラウザやAWSコンソールの応答が遅くなる可能性があります

## 開発者向け情報

### 拡張機能の仕組み

1. `manifest.json`: Chrome拡張機能の設定を定義
2. `popup.html/js`: ユーザーインターフェースと設定の管理
3. `content.js`: AWS CloudFormationコンソール上で実行され、更新ボタンの自動クリックを制御

### 更新ボタンの検出

以下のセレクタを使用してボタンを特定します：

```javascript
const selectors = [
  'button.stacks-refresh-button[data-testid="refresh-button"]',
  'button[data-testid="refresh-button"]',
  'button[aria-label="Refresh"]'
];
