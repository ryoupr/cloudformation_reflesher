let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleRefresh');
  const intervalInput = document.getElementById('interval');
  const statusDiv = document.getElementById('status');

  // デバッグログ出力
  function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
  }

  // エラーログ出力
  function errorLog(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error: ${message}`, error || '');
    statusDiv.className = 'status stopped';
    statusDiv.textContent = `エラー: ${message}`;
  }

  // 現在のタブを取得
  async function getCurrentTab() {
    try {
      debugLog('現在のタブを取得中...');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('アクティブなタブが見つかりません');
      }
      debugLog('タブ情報:', tab);
      return tab;
    } catch (error) {
      errorLog('タブの取得に失敗しました', error);
      throw error;
    }
  }

  // content.jsとの接続を確認
  async function checkContentScriptConnection(tabId) {
    debugLog('content.jsとの接続を確認中...');
    
    // 最大3回まで接続を試みる
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        debugLog('content.jsとの接続を確認しました');
        return true;
      } catch (error) {
        debugLog(`接続確認試行 ${attempt}/3 失敗`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
        }
      }
    }
    return false;
  }

  // 更新状態の切り替え
  async function toggleRefresh() {
    try {
      debugLog('更新状態の切り替えを開始...');
      const tab = await getCurrentTab();
      
      // URLの確認
      if (!tab.url.includes('console.aws.amazon.com') || !tab.url.includes('cloudformation')) {
        throw new Error('このページではこの拡張機能を使用できません');
      }

      // content.jsとの接続確認
      const isConnected = await checkContentScriptConnection(tab.id);
      if (!isConnected) {
        throw new Error('content.jsとの接続が確立できません。ページをリロードしてください。');
      }

      isRunning = !isRunning;
      debugLog(`更新状態を切り替え: ${isRunning ? '開始' : '停止'}`);

      // UIの更新
      toggleButton.textContent = isRunning ? '停止' : '開始';
      statusDiv.className = `status ${isRunning ? 'running' : 'stopped'}`;
      statusDiv.textContent = isRunning ? '実行中' : '停止中';

      const interval = parseInt(intervalInput.value) * 1000;
      debugLog(`更新間隔を設定: ${interval}ms`);

      // content.jsへメッセージ送信
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: isRunning ? 'start' : 'stop',
          interval: interval
        });
        debugLog('メッセージを送信しました');
      } catch (error) {
        errorLog('content.jsへのメッセージ送信に失敗しました', error);
        isRunning = !isRunning; // 状態を元に戻す
        toggleButton.textContent = isRunning ? '停止' : '開始';
        statusDiv.className = 'status stopped';
        statusDiv.textContent = 'エラー: メッセージ送信に失敗しました';
        throw error;
      }
    } catch (error) {
      errorLog('更新処理でエラーが発生しました', error);
    }
  }

  // ボタンクリックイベントの設定
  toggleButton.addEventListener('click', toggleRefresh);
});
