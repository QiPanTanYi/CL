// 从存储中加载快捷方式
function loadShortcuts() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('shortcuts', (data) => {
      resolve(data.shortcuts || {});
    });
  });
}

// 监听 omnibox 输入变化
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const shortcuts = await loadShortcuts();
  let suggestions = [];
  
  for (const [key, url] of Object.entries(shortcuts)) {
    if (key.startsWith(text)) {
      suggestions.push({
        content: url,
        description: `<url>${url}</url> - 快捷键: <match>${key}</match>`
      });
    }
  }
  
  suggest(suggestions);
});

// 处理用户选择
chrome.omnibox.onInputEntered.addListener(async (text) => {
  const shortcuts = await loadShortcuts();
  let url = text;
  
  if (shortcuts[text]) {
    url = shortcuts[text];
  } else if (!text.startsWith('http://') && !text.startsWith('https://')) {
    url = 'https://' + text;
  }
  
  chrome.tabs.update({ url: url });
});

// 监听安装或更新
chrome.runtime.onInstalled.addListener(() => {
  // 不再初始化默认快捷方式
  console.log('扩展已安装或更新');
});