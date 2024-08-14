export function getFormattedDateTime(date?: Date): string {
  const now = new Date();
  if (date) {
    now.setTime(date.getTime());
  }
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}-${hour}${minute}${second}`;
}
