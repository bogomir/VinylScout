chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-wantlist',
    title: 'VinylScout: добавить в Wantlist',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'add-to-wantlist') return;

  const query = info.selectionText.trim();
  if (!query) return;

  const { discogsToken, discogsUsername } = await chrome.storage.local.get([
    'discogsToken',
    'discogsUsername',
  ]);

  if (!discogsToken || !discogsUsername) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_ERROR',
      message: 'Сначала укажи токен в настройках расширения (нажми на иконку VinylScout)',
    });
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: 'SHOW_PANEL', query });

  try {
    const results = await searchDiscogs(query, discogsToken);
    chrome.tabs.sendMessage(tab.id, { type: 'SHOW_RESULTS', results, query });
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_ERROR',
      message: 'Ошибка поиска: ' + err.message,
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ADD_TO_WANTLIST') {
    addToWantlist(message.releaseId).then(sendResponse);
    return true;
  }
  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
  }
});

async function searchDiscogs(query, token) {
  const url =
    'https://api.discogs.com/database/search?' +
    new URLSearchParams({ q: query, type: 'release', per_page: '10' });

  const res = await fetch(url, {
    headers: {
      Authorization: `Discogs token=${token}`,
      'User-Agent': 'VinylScout/1.0 +https://github.com/vinylscout',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data.results.map((r) => ({
    id: r.id,
    title: r.title,
    year: r.year || '',
    thumb: r.thumb || '',
    country: r.country || '',
    format: Array.isArray(r.format) ? r.format.join(', ') : '',
  }));
}

async function addToWantlist(releaseId) {
  const { discogsToken, discogsUsername } = await chrome.storage.local.get([
    'discogsToken',
    'discogsUsername',
  ]);

  try {
    const res = await fetch(
      `https://api.discogs.com/users/${encodeURIComponent(discogsUsername)}/wants/${releaseId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Discogs token=${discogsToken}`,
          'User-Agent': 'VinylScout/1.0 +https://github.com/vinylscout',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
