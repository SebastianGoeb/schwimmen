function padTwoDigits(n: number): string {
  return n.toString().padStart(2, "0");
}
export function formatMaskedTime(seconds: number): string {
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = Math.floor(seconds % 60);
  const centsPart = Math.round((seconds % 1) * 100);
  return `${padTwoDigits(minutesPart)}:${padTwoDigits(secondsPart)},${padTwoDigits(centsPart)}`;
}
