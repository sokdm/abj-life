export const LAGOS_TIME_ZONE = "Africa/Lagos";

export const timePhases = {
  dawn: { label: "Dawn", start: 5.5, end: 7, tint: "rgba(255, 205, 146, 0.22)", sky: "#496077" },
  morning: { label: "Morning", start: 7, end: 12, tint: "rgba(255, 232, 184, 0.16)", sky: "#78b7d8" },
  afternoon: { label: "Afternoon", start: 12, end: 16.5, tint: "rgba(255, 216, 143, 0.18)", sky: "#66a9d8" },
  evening: { label: "Evening", start: 16.5, end: 18.5, tint: "rgba(255, 145, 84, 0.26)", sky: "#9b6b76" },
  night: { label: "Night", start: 18.5, end: 29.5, tint: "rgba(20, 35, 75, 0.42)", sky: "#101a33" }
};

export function getNigeriaTime(date = new Date(), override = process.env.DEV_TIME_OVERRIDE) {
  const allowedOverride = process.env.NODE_ENV !== "production" && override && timePhases[override];
  if (allowedOverride) {
    return {
      iso: date.toISOString(),
      display: timePhases[override].label,
      phase: override,
      timezone: LAGOS_TIME_ZONE
    };
  }

  const parts = new Intl.DateTimeFormat("en-NG", {
    timeZone: LAGOS_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).formatToParts(date);
  const hourText = parts.find((part) => part.type === "hour")?.value || "12";
  const minuteText = parts.find((part) => part.type === "minute")?.value || "00";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value || "AM";
  let hour = Number(hourText) % 12;
  if (dayPeriod.toUpperCase() === "PM") hour += 12;
  const decimalHour = hour + Number(minuteText) / 60;
  const phase = decimalHour < 5.5 ? "night" :
    decimalHour < 7 ? "dawn" :
      decimalHour < 12 ? "morning" :
        decimalHour < 16.5 ? "afternoon" :
          decimalHour < 18.5 ? "evening" : "night";

  return {
    iso: date.toISOString(),
    display: `${hourText}:${minuteText} ${dayPeriod}`,
    phase,
    timezone: LAGOS_TIME_ZONE
  };
}
