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

    // テキストと favicon をまとめたリンク
    const linkWrapper = document.createElement("a");
    linkWrapper.href = d.url;
    linkWrapper.target = '_blank';
    linkWrapper.className = 'item-link';
    linkWrapper.title = d.url;

    const favicon = document.createElement("img");
    favicon.src = d.favicon;
    favicon.width = 16;
    favicon.height = 16;
    favicon.className = 'favicon';
    favicon.style.marginRight = '6px';

    const text = document.createElement("span");
    text.textContent = `[${d.company}] ${d.title} - ${d.date}`;
    text.className = 'item-text';

    linkWrapper.append(favicon, text);

    const editBtn = document.createElement("button");
    editBtn.className = 'icon-btn';
    editBtn.title = '編集';
    const editImg = document.createElement("img");
    editImg.src = 'icons/edit.svg';
    editImg.alt = '編集';
    editBtn.appendChild(editImg);
    editBtn.addEventListener('click', () => startEdit(i, d));

    const delBtn = document.createElement("button");
    delBtn.className = 'icon-btn';
    delBtn.title = '削除';
    const delImg = document.createElement("img");
    delImg.src = 'icons/delete.svg';
    delImg.alt = '削除';
    delBtn.appendChild(delImg);
    delBtn.addEventListener('click', () => deleteEntry(i));

    li.append(linkWrapper, editBtn, delBtn);
    ul.appendChild(li);
  });
}

renderList();