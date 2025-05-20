// 保存ボタン押下時にタイトル・日付・URL・企業名を取得してストレージに保存
document.getElementById("save").addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const date  = document.getElementById("date").value;
  if (!title || !date) return;

  // 現在アクティブなタブURLを取得
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url    = tabs[0].url;
    const domain = new URL(url).hostname;
    const company = domain.replace(/^www\./, '').split('.')[0];

    const deadline = { title, date, url, company };
    const { deadlines = [] } = await chrome.storage.local.get("deadlines");
    deadlines.push(deadline);
    await chrome.storage.local.set({ deadlines });

    window.location.reload();
  });
});

// 既存の締切リストを読み込んで表示
async function loadDeadlines() {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const ul = document.getElementById("list");
  ul.innerHTML = '';

  deadlines.forEach(d => {
    const li = document.createElement("li");

    // Favicon表示
    const favicon = document.createElement("img");
    favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(d.url).hostname}`;
    favicon.width = 16;
    favicon.height = 16;
    favicon.style.verticalAlign = 'middle';
    favicon.style.marginRight    = '6px';

    // テキスト表示
    const text = document.createElement("span");
    text.textContent = `[${d.company}] ${d.title} - ${d.date}`;

    // URLリンク
    const link = document.createElement("a");
    link.href   = d.url;
    link.textContent = ' 🔗';
    link.target = '_blank';
    link.style.marginLeft = '8px';

    li.append(favicon, text, link);
    ul.appendChild(li);
  });
}
loadDeadlines();