// deadline に対して個別アラームを打つ関数
function scheduleDeadlineAlarms(id, dateStr) {
  const base = new Date(dateStr);

  // 前日12:00
  const d1 = new Date(base);
  d1.setDate(d1.getDate() - 1);
  d1.setHours(12, 0, 0, 0);
  if (d1.getTime() > Date.now()) {
    chrome.alarms.create(`dl-${id}-1`, { when: d1.getTime() });
  } else {
    // 既に過ぎていれば即通知
    notifySingleDeadline(dateStr, id, 'tomorrowNoon');
  }

  // 前日18:00
  const d2 = new Date(base);
  d2.setDate(d2.getDate() - 1);
  d2.setHours(18, 0, 0, 0);
  if (d2.getTime() > Date.now()) {
    chrome.alarms.create(`dl-${id}-2`, { when: d2.getTime() });
  } else {
    notifySingleDeadline(dateStr, id, 'tomorrowEvening');
  }

  // 当日10:00
  const d3 = new Date(base);
  d3.setHours(10, 0, 0, 0);
  if (d3.getTime() > Date.now()) {
    chrome.alarms.create(`dl-${id}-3`, { when: d3.getTime() });
  } else {
    notifySingleDeadline(dateStr, id, 'todayMorning');
  }
}

// 単発通知用ヘルパー（ID と dateStr から締切情報を取得し、1回だけ通知する）
async function notifySingleDeadline(dateStr, id, type) {
  const { deadlines=[] } = await chrome.storage.local.get('deadlines');
  const d = deadlines.find(x => x.id === id);
  if (!d) return;
  let title, msgType;
  if (type === 'tomorrowNoon' || type === 'tomorrowEvening') {
    title = '締切が明日です';
    msgType = '明日';
  } else {
    title = '締切が本日です';
    msgType = '本日';
  }
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title,
    message: `${d.company} 「${d.title}」 の締切は${msgType}です！\nURL: ${d.url}`,
    requireInteraction: true
  });
}
