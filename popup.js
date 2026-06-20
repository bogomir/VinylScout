document.addEventListener('DOMContentLoaded', async () => {
  const { discogsToken, discogsUsername } = await chrome.storage.local.get([
    'discogsToken',
    'discogsUsername',
  ]);

  const status = document.getElementById('status');
  const hint = document.getElementById('hint');

  if (discogsToken && discogsUsername) {
    status.innerHTML = `<span class="ok">✓ Подключено</span> как <strong>${discogsUsername}</strong>`;
    hint.textContent = 'Выдели название альбома на любой странице и выбери «VinylScout» в контекстном меню.';
  } else {
    status.innerHTML = '<span class="warn">✗ Не настроено</span>';
    hint.textContent = 'Укажи Discogs токен и логин в настройках, чтобы начать.';
  }

  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
