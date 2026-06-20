let panel = null;

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'SHOW_PANEL':
      showPanel(message.query);
      break;
    case 'SHOW_RESULTS':
      showResults(message.results, message.query);
      break;
    case 'SHOW_ERROR':
      showError(message.message);
      break;
  }
});

function createPanel() {
  if (panel) panel.remove();

  panel = document.createElement('div');
  panel.id = 'vinylscout-panel';
  document.body.appendChild(panel);

  document.addEventListener('click', handleOutsideClick, true);
  return panel;
}

function handleOutsideClick(e) {
  if (panel && !panel.contains(e.target)) {
    closePanel();
  }
}

function closePanel() {
  if (panel) {
    panel.remove();
    panel = null;
    document.removeEventListener('click', handleOutsideClick, true);
  }
}

function header() {
  return '<div class="vs-header"><span class="vs-logo">VinylScout</span><button class="vs-close-btn">✕</button></div>';
}

function bindClose(p) {
  p.querySelector('.vs-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });
}

function showPanel(query) {
  const p = createPanel();
  p.innerHTML =
    header() +
    `<div class="vs-content">
      <div class="vs-query">Ищу: <strong>${esc(query)}</strong></div>
      <div class="vs-loading"><div class="vs-spinner"></div><span>Поиск в Discogs...</span></div>
    </div>`;
  bindClose(p);
}

function showResults(results, query) {
  if (!panel) return;

  const content = panel.querySelector('.vs-content');

  if (!results || results.length === 0) {
    content.innerHTML =
      `<div class="vs-query">Ищу: <strong>${esc(query)}</strong></div>` +
      '<div class="vs-empty">Ничего не найдено. Попробуй уточнить запрос.</div>';
    return;
  }

  const items = results
    .map(
      (r) =>
        `<div class="vs-item">
          ${r.thumb ? `<img class="vs-thumb" src="${r.thumb}" alt="">` : '<div class="vs-thumb vs-no-thumb"></div>'}
          <div class="vs-info">
            <div class="vs-title">${esc(r.title)}</div>
            <div class="vs-meta">${[r.year, r.country, r.format].filter(Boolean).join(' · ')}</div>
          </div>
          <button class="vs-add-btn" data-id="${r.id}">+ Wantlist</button>
        </div>`
    )
    .join('');

  content.innerHTML =
    `<div class="vs-query">Ищу: <strong>${esc(query)}</strong></div>` +
    `<div class="vs-results">${items}</div>`;

  content.querySelectorAll('.vs-add-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToWantlist(btn.dataset.id, btn);
    });
  });
}

function showError(message) {
  const errHtml = `<div class="vs-error">${esc(message)}</div>`;

  if (!panel) {
    const p = createPanel();
    p.innerHTML = header() + `<div class="vs-content">${errHtml}<button class="vs-settings-btn">Открыть настройки</button></div>`;
    bindClose(p);
    p.querySelector('.vs-settings-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    });
    return;
  }

  const content = panel.querySelector('.vs-content');
  if (content) {
    content.querySelector('.vs-loading')?.remove();
    content.insertAdjacentHTML('beforeend', errHtml);
  }
}

async function addToWantlist(releaseId, btn) {
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await chrome.runtime.sendMessage({
      type: 'ADD_TO_WANTLIST',
      releaseId: Number(releaseId),
    });

    if (res.success) {
      btn.textContent = '✓ Добавлено';
      btn.classList.add('vs-added');
    } else {
      btn.textContent = '✗ Ошибка';
      btn.classList.add('vs-err-btn');
      btn.disabled = false;
      btn.title = res.error || 'Неизвестная ошибка';
    }
  } catch (e) {
    btn.textContent = '✗ Ошибка';
    btn.disabled = false;
    btn.title = e.message;
  }
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}
