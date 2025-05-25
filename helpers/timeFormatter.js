// Форматування UTC-часу у локальний формат для input[type="time"]
export function formatToLocalInputTime(utcTimeStr) {
  if (!utcTimeStr || !/^\d{2}:\d{2}$/.test(utcTimeStr)) return "";
  const [hoursUtc, minutesUtc] = utcTimeStr.split(":").map(Number);
  const tempDate = new Date();
  tempDate.setUTCHours(hoursUtc, minutesUtc, 0, 0);
  const localHours = tempDate.getHours().toString().padStart(2, "0");
  const localMinutes = tempDate.getMinutes().toString().padStart(2, "0");
  return `${localHours}:${localMinutes}`;
}

// Форматування локального часу input[type="time"] у UTC-рядок
export function formatToUtcTimeStr(localInputTime) {
  if (!localInputTime) return null;
  const [hoursLocal, minutesLocal] = localInputTime.split(":").map(Number);
  const tempDate = new Date();
  tempDate.setHours(hoursLocal, minutesLocal, 0, 0);
  const utcHours = tempDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes = tempDate.getUTCMinutes().toString().padStart(2, "0");
  return `${utcHours}:${utcMinutes}`;
}

// Форматування UTC-рядка у локальний формат дати/часу для відображення
export function formatUtcToRegion(utcString, lang = "uk") {
  if (!utcString) return "";
  const safeUtc = utcString.endsWith("Z") ? utcString : utcString + "Z";
  return new Date(safeUtc).toLocaleString(
    lang === "uk" ? "uk-UA" : "en-US");
}