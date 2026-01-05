function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// 주 시작을 월요일로 잡음(한국 기준 선호)
function startOfWeekMonday(date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0=일,1=월...
  const diff = day === 0 ? -6 : 1 - day; // 일요일이면 -6
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekMonday(date) {
  const s = startOfWeekMonday(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

module.exports = { startOfDay, endOfDay, startOfWeekMonday, endOfWeekMonday };
