/**
 * parse cron to interval time
 * 
 * @param {string} cron ex) * * * * * *
 * *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └─ day of week (0-7, 1L-7L) (0 or 7 is Sun)
│    │    │    │    └────── month (1-12, JAN-DEC)
│    │    │    └─────────── day of month (1-31, L)
│    │    └──────────────── hour (0-23)
│    └───────────────────── minute (0-59)
└────────────────────────── second (0-59, optional)
 * @returns {number | null} interval time
 */
export default function parseCronInterval(cron: string): number {
  const parts = cron.trim().split(' ');
  if (parts.length < 5) {
    return null;
  }
  const minuteField = parts[0];
  if (minuteField.startsWith('*/')) {
    const interval = parseInt(minuteField.slice(2), 10);
    return isNaN(interval) ? 0 : interval * 60 * 1000;
  }
  if (/^\d+$/.test(minuteField)) {
    return 60 * 60 * 1000;
  }
  return null;
}
