document.addEventListener('DOMContentLoaded', function() {
  const analyzeButton = document.getElementById('analyze') as HTMLButtonElement;
  const urlInput = document.getElementById('companyUrl') as HTMLInputElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  analyzeButton.addEventListener('click', async () => {
    const url = urlInput.value;
    if (!url) {
      statusDiv.textContent = 'URLを入力してください';
      return;
    }

    try {
      statusDiv.textContent = '分析中...';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('タブIDが見つかりません');
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: 'ANALYZE_COMPANY',
        url: url
      });

      statusDiv.textContent = '分析完了！フォームに入力中...';
    } catch (error) {
      statusDiv.textContent = `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`;
    }
  });
}); 