document.addEventListener('DOMContentLoaded', () => {
  const shortcutList = document.getElementById('shortcutList');
  const addShortcutForm = document.getElementById('addShortcutForm');
  const uploadJsonForm = document.getElementById('uploadJsonForm');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const keyInput = document.getElementById('keyInput');
  const urlInput = document.getElementById('urlInput');
  const downloadJsonButton = document.getElementById('downloadJsonButton');

  // 加载并显示现有快捷方式
  function loadShortcuts() {
    chrome.storage.sync.get('shortcuts', (data) => {
      const shortcuts = data.shortcuts || {};
      shortcutList.innerHTML = '';
      for (const [key, url] of Object.entries(shortcuts)) {
        const li = document.createElement('li');

        // 显示 key
        const keyDisplay = document.createElement('span');
        keyDisplay.className = 'key-display';
        keyDisplay.textContent = key.length > 5 ? key.substring(0, 5) + '...' : key;

        // 显示 url
        const urlDisplay = document.createElement('span');
        urlDisplay.className = 'url-display';
        urlDisplay.textContent = url.length > 25 ? url.substring(0, 25) + '...' : url;

        // 添加浮动块级元素（显示完整的 JSON 格式内容）
        const jsonTooltip = document.createElement('div');
        jsonTooltip.className = 'json-tooltip';
        jsonTooltip.textContent = `${key}: ${url}`; // 显示完整的 JSON 格式内容

        li.appendChild(keyDisplay);
        li.appendChild(document.createTextNode(': '));
        li.appendChild(urlDisplay);
        li.appendChild(jsonTooltip); // 将浮动块级元素添加到 li 中

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteShortcut(key);
        li.appendChild(deleteBtn);

        // 添加双击事件监听器
        li.addEventListener('dblclick', () => {
          copyToClipboard(url); // 复制网址
          showCopySuccessMessage(); // 显示复制成功提示
        });

        shortcutList.appendChild(li);
      }
    });
  }

  // 复制到剪贴板
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('复制失败: ', err);
    });
  }

  // 显示复制成功提示
  function showCopySuccessMessage() {
    const message = document.createElement('div');
    message.textContent = '复制成功';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = '#4CAF50';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    message.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(message);

    // 3 秒后自动消失
    setTimeout(() => {
      document.body.removeChild(message);
    }, 3000);
  }

  // 添加新快捷方式
  addShortcutForm.onsubmit = (e) => {
    e.preventDefault();
    const key = keyInput.value.trim();
    const url = urlInput.value.trim();
    if (key && url) {
      chrome.storage.sync.get('shortcuts', (data) => {
        const shortcuts = data.shortcuts || {};
        shortcuts[key] = url;
        chrome.storage.sync.set({ shortcuts }, () => {
          loadShortcuts();
          keyInput.value = '';
          urlInput.value = '';
        });
      });
    }
  };

  // 删除快捷方式
  function deleteShortcut(key) {
    chrome.storage.sync.get('shortcuts', (data) => {
      const shortcuts = data.shortcuts || {};
      delete shortcuts[key];
      chrome.storage.sync.set({ shortcuts }, loadShortcuts);
    });
  }

  // 处理 JSON 文件上传
  uploadJsonForm.onsubmit = (e) => {
    e.preventDefault();
    const file = jsonFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const newShortcuts = JSON.parse(event.target.result);
          chrome.storage.sync.set({ shortcuts: newShortcuts }, () => {
            loadShortcuts();
            alert('快捷方式已成功更新！');
          });
        } catch (error) {
          alert('上传的 JSON 文件格式不正确，请检查文件内容。');
        }
      };
      reader.readAsText(file);
    }
  };

  // 处理 JSON 文件下载
  downloadJsonButton.onclick = () => {
    chrome.storage.sync.get('shortcuts', (data) => {
      const shortcuts = data.shortcuts || {};
      const jsonStr = JSON.stringify(shortcuts, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Favorites.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // 初始加载
  loadShortcuts();
});