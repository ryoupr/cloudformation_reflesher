let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleRefresh');
  const intervalInput = document.getElementById('interval');
  const statusDiv = document.getElementById('status');

  // 現在のタブを取得
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  // 更新状態の切り替え
  async function toggleRefresh() {
    const tab = await getCurrentTab();
    isRunning = !isRunning;

    // UIの更新
    toggleButton.textContent = isRunning ? '停止' : '開始';
    statusDiv.className = `status ${isRunning ? 'running' : 'stopped'}`;
    statusDiv.textContent = isRunning ? '実行中' : '停止中';

    // content.jsへメッセージ送信
    chrome.tabs.sendMessage(tab.id, {
      action: isRunning ? 'start' : 'stop',
      interval: parseInt(intervalInput.value) * 1000 // ミリ秒に変換
    });
  }

  // ボタンクリックイベントの設定
  toggleButton.addEventListener('click', toggleRefresh);
});
