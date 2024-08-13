export function parseZeit(time: string): number {
  const [minutes, seconds] = time.trim().split(":");
  const result = Number(minutes) * 60 + Number(seconds.replace(",", "."));
  return result;
}

export function formatZeit(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ns = Math.round((seconds % 1) * 10);
  return `${padZeros(m, 2)}:${padZeros(s, 2)},${ns}`;
}

function padZeros(n: number, width: number): string {
  return String(n).padStart(width, "0");
}
