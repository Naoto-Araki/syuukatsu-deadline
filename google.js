/**
 * OAuth2 トークン取得
 */
export async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, token => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * YYYY-MM-DD 文字列の翌日を返す
 */
function nextDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/**
 * カレンダーにイベントを追加し、生成された event.id を返す
 */
export async function insertCalendarEvent(token, { summary, description, startDate, url }) {
  const event = {
    summary,
    description: `${description}\n${url}`,
    start: { date: startDate },
    end:   { date: nextDay(startDate) }
  };

  const resp = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const text = await resp.text();
  if (!resp.ok) {
    console.error("Google Calendar Insert Error:", resp.status, text);
    throw new Error(`Calendar Insert Failed: ${resp.statusText}`);
  }

  const data = JSON.parse(text);
  return data.id;
}

/**
 * 既存イベントを更新する
 */
export async function updateCalendarEvent(token, eventId, { summary, description, startDate, url }) {
  const event = {
    summary,
    description: `${description}\n${url}`,
    start: { date: startDate },
    end:   { date: nextDay(startDate) }
  };

  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const text = await resp.text();
  if (!resp.ok) {
    console.error("Google Calendar Update Error:", resp.status, text);
    throw new Error(`Calendar Update Failed: ${resp.statusText}`);
  }

  return JSON.parse(text);
}

/**
 * カレンダーからイベントを削除する
 */
export async function deleteCalendarEvent(token, eventId) {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Google Calendar Delete Error:", resp.status, text);
    throw new Error(`Calendar Delete Failed: ${resp.statusText}`);
  }
}
