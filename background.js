chrome.runtime.onInstalled.addListener(() => {
  ['12', '18'].forEach(hour => {
    const when = new Date();
    when.setHours(parseInt(hour), 0, 0, 0);
    if (when.getTime() <= Date.now()) when.setDate(when.getDate() + 1);
    chrome.alarms.create(`check${hour}`, { when: when.getTime(), periodInMinutes: 24 * 60 });
  });
});

chrome.runtime.onStartup.addListener(() => {
  ['12', '18'].forEach(hour => {
    chrome.alarms.clear(`check${hour}`);
    const when = new Date();
    when.setHours(parseInt(hour), 0, 0, 0);
    if (when.getTime() <= Date.now()) when.setDate(when.getDate() + 1);
    chrome.alarms.create(`check${hour}`, { when: when.getTime(), periodInMinutes: 24 * 60 });
  });
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (!alarm.name.startsWith('check')) return;
  const { deadlines = [] } = await chrome.storage.local.get('deadlines');
  const today = new Date().toISOString().split('T')[0];

  deadlines.forEach(d => {
    const diff = new Date(d.date) - new Date(today);
    if (0 <= diff && diff <= 86400000) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: d.favicon,
        title: '締切が近い！',
        message: `${d.title} の締切は ${d.date} です`
      });
    }
  });
});