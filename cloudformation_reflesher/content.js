let refreshInterval = null;

// リフレッシュボタンを探す関数
function findRefreshButton() {
  // CloudFormationコンソールの特定のリフレッシュボタンを探す
  const selectors = [
    'button.stacks-refresh-button[data-testid="refresh-button"]',  // スタック一覧の更新ボタン
    'button[data-testid="refresh-button"]',                        // フォールバック：data-testid
    'button[aria-label="Refresh"]'                                 // フォールバック：aria-label
  ];

  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button) return button;
  }

  return null;
}

// リフレッシュ処理を実行する関数
function performRefresh() {
  const refreshButton = findRefreshButton();
  if (refreshButton) {
    refreshButton.click();
    console.log('CloudFormation画面を更新しました');
  } else {
    console.warn('リフレッシュボタンが見つかりませんでした');
  }
}

// 自動更新の開始
function startAutoRefresh(interval) {
  stopAutoRefresh(); // 既存のインターバルをクリア
  refreshInterval = setInterval(performRefresh, interval);
  console.log(`自動更新を開始しました（間隔: ${interval/1000}秒）`);
}

// 自動更新の停止
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('自動更新を停止しました');
  }
}

// popup.jsからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    startAutoRefresh(message.interval);
  } else if (message.action === 'stop') {
    stopAutoRefresh();
  }
});
