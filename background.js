// 毎日指定時刻にアラームを発火する関数
function scheduleDailyAlarm(name, hour, minute = 0) {
  const now = new Date();
  const when = new Date();
  when.setHours(hour, minute, 0, 0);
  if (when.getTime() <= now.getTime()) {
    when.setDate(when.getDate() + 1);
  }
  chrome.alarms.create(name, { when: when.getTime(), periodInMinutes: 24 * 60 });
}

// 通知処理を共通化
async function notifyDeadlines(alarmName) {
  const { deadlines = [] } = await chrome.storage.local.get("deadlines");
  const today = new Date().toISOString().split("T")[0];

  deadlines.forEach(d => {
    const diffDays = (new Date(d.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
    if ((alarmName === "alertDeadlineTomorrowNoon" || alarmName === "alertDeadlineTomorrowEvening") && diffDays === 1) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '締切が明日です',
        message: `${d.company} 「${d.title}」 の締切は明日です！
URL: ${d.url}`,
        requireInteraction: true,
        priority: 2
      });
    } else if (alarmName === "alertDeadlineTodayMorning" && diffDays === 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '締切が本日です',
        message: `${d.company} 「${d.title}」 の締切は本日です！
URL: ${d.url}`,
        requireInteraction: true,
        priority: 2
      });
    }
  });
}

// 過去の通知を起動時にチェックして発火（Chrome未起動時のアラーム逃しを補填）
function checkMissedAlarms() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 18) {
    notifyDeadlines("alertDeadlineTomorrowNoon");
    notifyDeadlines("alertDeadlineTomorrowEvening");
    notifyDeadlines("alertDeadlineTodayMorning");
  } else if (hour >= 12) {
    notifyDeadlines("alertDeadlineTomorrowNoon");
    notifyDeadlines("alertDeadlineTodayMorning");
  } else if (hour >= 10) {
    notifyDeadlines("alertDeadlineTodayMorning");
  }
}

// アラームスケジュール設定関数
function setupAlarms() {
  // 前日の12:00 と 18:00
  scheduleDailyAlarm("alertDeadlineTomorrowNoon", 12);
  scheduleDailyAlarm("alertDeadlineTomorrowEvening", 18);
  // 当日の10:00
  scheduleDailyAlarm("alertDeadlineTodayMorning", 10);
}

// インストール時と起動時にアラーム設定 & ミスチェック
chrome.runtime.onInstalled.addListener(() => {
  setupAlarms();
  checkMissedAlarms();
});
chrome.runtime.onStartup.addListener(() => {
  setupAlarms();
  checkMissedAlarms();
});

// アラーム発火時に通知
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("alertDeadline")) {
    notifyDeadlines(alarm.name);
  }
});