chrome.runtime.onMessage.addListener((
  message: { type: string; url: string },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { success: boolean; error?: string }) => void
) => {
  if (message.type === 'ANALYZE_COMPANY') {
    // アクティブなタブにメッセージを転送
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          message,
          (response) => {
            sendResponse(response);
          }
        );
      }
    });
    return true;
  }
}); 