// 毎日正午(12:00)と18:00に締切チェックアラームを発火する関数
function scheduleDailyAlarm(name, hour, minute = 0) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  chrome.alarms.create(name, { when: next.getTime(), periodInMinutes: 24 * 60 });
}

// インストール時にアラームをスケジュール
chrome.runtime.onInstalled.addListener(() => {
  scheduleDailyAlarm("checkDeadlinesNoon", 12);
  scheduleDailyAlarm("checkDeadlinesEvening", 18);
});

// ブラウザ起動時にもアラームを再スケジュール
chrome.runtime.onStartup.addListener(() => {
  scheduleDailyAlarm("checkDeadlinesNoon", 12);
  scheduleDailyAlarm("checkDeadlinesEvening", 18);
});

// アラーム発火時に締切をチェックして通知を表示
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("checkDeadlines")) return;
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const today = new Date().toISOString().split("T")[0];

  deadlines.forEach(d => {
    const diff = new Date(d.date) - new Date(today);
    if (diff >= 0 && diff <= 86400000) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '締切が近い！',
        message: `${d.company} "${d.title}" が締切日の前後に該当します！`,
        priority: 2
      });
    }
  });
});

// // 拡張機能インストール時にアラームを設定（1時間ごとにチェック）
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.alarms.create("checkDeadlines", { periodInMinutes: 60 });
// });

// // アラーム発火時に締切が近いものを通知
// chrome.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name !== "checkDeadlines") return;
//   const { deadlines = [] } = await chrome.storage.local.get("deadlines");
//   const today = new Date().toISOString().split("T")[0];

//   deadlines.forEach(d => {
//     const diff = new Date(d.date) - new Date(today);
//     if (diff <= 86400000 && diff >= 0) {
//       chrome.notifications.create({
//         type: 'basic',
//         iconUrl: 'icon.png',
//         title: '締切が近い！',
//         message: `${d.company} "${d.title}" が明日締切です！`,
//         priority: 2
//       });
//     }
//   });
// });