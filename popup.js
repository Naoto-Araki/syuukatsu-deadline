let editIndex = null;
const saveBtn = document.getElementById("save");

saveBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  if (!title || !date) return;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = tabs[0].url;
    const host = new URL(url).hostname;
    const company = host.replace(/^(www\.)/, '').split('.')[0];
    const favicon = `https://www.google.com/s2/favicons?domain=${host}`;

    const { deadlines = [] } = await chrome.storage.local.get("deadlines");
    const entry = { title, date, url, company, favicon };

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

function clearInputs() {
  document.getElementById("title").value = '';
  document.getElementById("date").value = '';
}

async function renderList() {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const ul = document.getElementById("list");
  ul.innerHTML = '';

  deadlines.forEach((d, i) => {
    const li = document.createElement("li");

    const iconBtn = (iconName, title) => {
      const btn = document.createElement("button");
      btn.className = 'icon-btn';
      btn.title = title;
      const img = document.createElement("img");
      img.src = `icons/${iconName}.svg`;
      img.alt = title;
      btn.appendChild(img);
      return btn;
    };

    const favicon = document.createElement("img");
    favicon.src = d.favicon;
    favicon.width = 16;
    favicon.height = 16;
    favicon.className = 'favicon';

    const text = document.createElement("span");
    text.textContent = `[${d.company}] ${d.title} - ${d.date}`;

    // ページを開くアイコンは link.svg に固定
    const viewLink = document.createElement("a");
    viewLink.href = d.url;
    viewLink.target = '_blank';
    viewLink.className = 'icon-link';
    viewLink.title = 'ページを開く';
    const linkImg = document.createElement("img");
    linkImg.src = 'icons/link.svg';
    linkImg.alt = 'リンク';
    viewLink.appendChild(linkImg);

    const editBtn = iconBtn('edit', '編集');
    editBtn.addEventListener('click', () => startEdit(i, d));

    const delBtn = iconBtn('delete', '削除');
    delBtn.addEventListener('click', () => deleteEntry(i));

    li.append(favicon, text, viewLink, editBtn, delBtn);
    ul.appendChild(li);
  });
}

function startEdit(index, entry) {
  editIndex = index;
  document.getElementById("title").value = entry.title;
  document.getElementById("date").value = entry.date;
  saveBtn.querySelector('span').textContent = '更新';
}

async function deleteEntry(index) {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  deadlines.splice(index, 1);
  await chrome.storage.local.set({ deadlines });
  renderList();
}

renderList();