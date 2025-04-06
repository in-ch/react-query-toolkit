/**
 * Parses a simplified cron expression and returns approximate interval in ms.
 *
 * @param cron Cron expression (6 fields)
 * @returns interval in ms or null if unsupported
 */
export default function parseCronInterval(cron: string): number | null {
  const parts = cron.trim().split(' ');
  if (parts.length !== 6) return null;

  const [sec, min, hour, day, month, weekday] = parts;
  if (sec.startsWith('*/')) {
    const interval = parseInt(sec.slice(2), 10);
    return isNaN(interval) ? null : interval * 1000;
  }
  if (min.startsWith('*/')) {
    const interval = parseInt(min.slice(2), 10);
    return isNaN(interval) ? null : interval * 60 * 1000;
  }
  if (hour.startsWith('*/')) {
    const interval = parseInt(hour.slice(2), 10);
    return isNaN(interval) ? null : interval * 60 * 60 * 1000;
  }
  if (day.startsWith('*/')) {
    const interval = parseInt(day.slice(2), 10);
    return isNaN(interval) ? null : interval * 24 * 60 * 60 * 1000;
  }
  if (month.startsWith('*/')) {
    const interval = parseInt(month.slice(2), 10);
    return isNaN(interval) ? null : interval * 30 * 24 * 60 * 60 * 1000;
  }

  if (sec === '*' || /^\d+$/.test(sec)) {
    return 60 * 1000;
  }

  return null;
}
