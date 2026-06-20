document.addEventListener('DOMContentLoaded', async () => {
  const { discogsToken, discogsUsername } = await chrome.storage.local.get([
    'discogsToken',
    'discogsUsername',
  ]);

  if (discogsToken) document.getElementById('token').value = discogsToken;
  if (discogsUsername) document.getElementById('username').value = discogsUsername;

  document.getElementById('save-btn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const username = document.getElementById('username').value.trim();
    const msg = document.getElementById('message');
    const btn = document.getElementById('save-btn');

    if (!token || !username) {
      msg.className = 'message err';
      msg.textContent = 'Заполни оба поля.';
      return;
    }

    msg.className = 'message';
    msg.textContent = 'Проверяем соединение...';
    btn.disabled = true;

    try {
      const res = await fetch(
        `https://api.discogs.com/users/${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Discogs token=${token}`,
            'User-Agent': 'VinylScout/1.0 +https://github.com/vinylscout',
          },
        }
      );

      if (res.status === 404) {
        msg.className = 'message err';
        msg.textContent = 'Пользователь не найден. Проверь правильность логина.';
        return;
      }

      if (res.status === 401) {
        msg.className = 'message err';
        msg.textContent = 'Неверный токен. Проверь и скопируй снова.';
        return;
      }

      if (!res.ok) {
        msg.className = 'message err';
        msg.textContent = `Ошибка: HTTP ${res.status}`;
        return;
      }

      await chrome.storage.local.set({ discogsToken: token, discogsUsername: username });
      msg.className = 'message ok';
      msg.textContent = '✓ Сохранено! Всё работает. Можно закрыть эту вкладку.';
    } catch (e) {
      msg.className = 'message err';
      msg.textContent = 'Ошибка сети: ' + e.message;
    } finally {
      btn.disabled = false;
    }
  });
});
