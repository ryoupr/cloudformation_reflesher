let refreshInterval = null;

// デバッグログ出力
function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
}

// エラーログ出力
function errorLog(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error: ${message}`, error || '');
}

// リフレッシュボタンを探す関数
function findRefreshButtons() {
  debugLog('更新ボタンを検索中...');
  
  try {
    const buttons = document.querySelectorAll('button[data-testid="refresh-button"]');
    const buttonArray = Array.from(buttons);
    
    debugLog(`更新ボタンを${buttonArray.length}個検出:`, buttonArray.map(button => ({
      className: button.className,
      ariaLabel: button.getAttribute('aria-label'),
      textContent: button.textContent,
      isVisible: button.offsetParent !== null
    })));

    return buttonArray;
  } catch (error) {
    errorLog('更新ボタンの検索中にエラーが発生しました', error);
    return [];
  }
}

// リフレッシュ処理を実行する関数
function performRefresh() {
  debugLog('更新処理を開始...');
  
  try {
    const refreshButtons = findRefreshButtons();
    if (refreshButtons.length > 0) {
      refreshButtons.forEach((button, index) => {
        try {
          button.click();
          debugLog(`ボタン${index + 1}をクリックしました`, {
            className: button.className,
            ariaLabel: button.getAttribute('aria-label')
          });
        } catch (error) {
          errorLog(`ボタン${index + 1}のクリックに失敗しました`, error);
        }
      });
      debugLog(`更新完了（${refreshButtons.length}個のボタンをクリック）`);
    } else {
      errorLog('更新ボタンが見つかりませんでした');
    }
  } catch (error) {
    errorLog('更新処理でエラーが発生しました', error);
  }
}

// 自動更新の開始
function startAutoRefresh(interval) {
  debugLog(`自動更新を開始（間隔: ${interval/1000}秒）`);
  
  try {
    stopAutoRefresh(); // 既存のインターバルをクリア
    refreshInterval = setInterval(performRefresh, interval);
    debugLog('インターバルタイマーを設定しました');
  } catch (error) {
    errorLog('自動更新の開始に失敗しました', error);
  }
}

// 自動更新の停止
function stopAutoRefresh() {
  debugLog('自動更新を停止します');
  
  try {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      debugLog('インターバルタイマーをクリアしました');
    }
  } catch (error) {
    errorLog('自動更新の停止に失敗しました', error);
  }
}

// popup.jsからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('メッセージを受信:', message);
  
  try {
    if (message.action === 'ping') {
      debugLog('接続確認を受信');
      sendResponse({ status: 'ok' });
      return true; // 非同期レスポンスのために必要
    } else if (message.action === 'start') {
      startAutoRefresh(message.interval);
    } else if (message.action === 'stop') {
      stopAutoRefresh();
    } else {
      errorLog('不明なアクション:', message.action);
    }
  } catch (error) {
    errorLog('メッセージ処理でエラーが発生しました', error);
  }
  
  // エラー時でもレスポンスを返す
  sendResponse({ status: 'error' });
  return true; // 非同期レスポンスのために必要
});

// 初期化時のデバッグ情報
debugLog('content.jsを初期化しました', {
  url: window.location.href,
  timestamp: new Date().toISOString()
});
