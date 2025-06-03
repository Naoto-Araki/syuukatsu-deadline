import {
  getAuthToken,
  insertCalendarEvent,
} from "./google.js";

let editIndex = null;
const saveBtn = document.getElementById("save");
const dateInput = document.getElementById('date');
const dateBtn = document.getElementById('date-btn');
const dateLabel = document.getElementById('date-label');

// カレンダーボタンで date picker を開く
dateBtn.addEventListener('click', () => {
  if (dateInput.showPicker) {
    dateInput.showPicker();
  } else {
    dateInput.focus();
    dateInput.click();
  }
});

// 日付選択後にラベルを更新
dateInput.addEventListener('change', () => {
  dateLabel.textContent = dateInput.value || '日付選択';
});

// 保存ボタン押下で締切を追加または更新
saveBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const date  = document.getElementById("date").value;
  if (!title || !date) return;

  // 現在タブの情報を取得
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url     = tabs[0].url;
    const host    = new URL(url).hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${host}`;
    const token = await getAuthToken(true);

    // カレンダー登録
    const eventId = await insertCalendarEvent(token, {
      summary: `${title}`,
      description: `締切日: ${date}`,
      startDate: date,
      url,
    });

    const { deadlines = [] } = await chrome.storage.local.get("deadlines");
    const entry = { title, date, url, favicon, eventId };

    if (editIndex === null) {
      deadlines.push(entry);
    } else {
      deadlines[editIndex] = entry;
      editIndex = null;
      saveBtn.querySelector('span').textContent = '保存';
    }

    await chrome.storage.local.set({ deadlines });
    renderList();
    clearInputs();
  });
});

// 入力欄をクリア
function clearInputs() {
  document.getElementById("title").value = '';
  dateInput.value = '';
  dateLabel.textContent = '日付選択';
}

// リストを描画
async function renderList() {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const ul = document.getElementById("list");
  ul.innerHTML = '';

  deadlines.forEach((d, i) => {
    const li = document.createElement("li");

    // リンクラッパー（favicon＋テキスト全体をクリック領域に）
    const linkWrapper = document.createElement("a");
    linkWrapper.href   = d.url;
    linkWrapper.target = '_blank';
    linkWrapper.className = 'item-link';
    linkWrapper.title = d.url;

    const faviconEl = document.createElement("img");
    faviconEl.src    = d.favicon;
    faviconEl.width  = 16;
    faviconEl.height = 16;
    faviconEl.className = 'favicon';
    faviconEl.style.marginRight = '6px';

    const textEl = document.createElement("span");
    textEl.textContent = `[${d.title} - ${d.date}`;
    textEl.className   = 'item-text';

    linkWrapper.append(faviconEl, textEl);

    // 編集ボタン
    const editBtn = document.createElement("button");
    editBtn.className = 'icon-btn';
    editBtn.title     = '編集';
    const editImg = document.createElement("img");
    editImg.src = 'icons/edit.svg';
    editImg.alt = '編集';
    editBtn.appendChild(editImg);
    editBtn.addEventListener('click', () => startEdit(i, d));

    // 削除ボタン
    const delBtn = document.createElement("button");
    delBtn.className = 'icon-btn';
    delBtn.title     = '削除';
    const delImg = document.createElement("img");
    delImg.src = 'icons/delete.svg';
    delImg.alt = '削除';
    delBtn.appendChild(delImg);
    delBtn.addEventListener('click', () => deleteEntry(i));

    li.append(linkWrapper, editBtn, delBtn);
    ul.appendChild(li);
  });
}

// 編集開始
function startEdit(index, entry) {
  editIndex = index;
  document.getElementById("title").value = entry.title;
  document.getElementById("date").value  = entry.date;
  saveBtn.querySelector('span').textContent = '更新';
}

// 削除処理
async function deleteEntry(index) {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  deadlines.splice(index, 1);
  await chrome.storage.local.set({ deadlines });
  renderList();
}

// 初回描画
renderList();
