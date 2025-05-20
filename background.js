// 拡張機能インストール時にアラームを設定（1時間ごとにチェック）
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkDeadlines", { periodInMinutes: 60 });
});

// アラーム発火時に締切が近いものを通知
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "checkDeadlines") return;
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const today = new Date().toISOString().split("T")[0];

  deadlines.forEach(d => {
    const diff = new Date(d.date) - new Date(today);
    if (diff <= 86400000 && diff >= 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '締切が近い！',
        message: `${d.company} "${d.title}" が明日締切です！`,
        priority: 2
      });
    }
  });
});