export function parseZeit(time: string): number {
  const [minutes, seconds] = time.trim().split(":");
  const result = Number(minutes) * 60 + Number(seconds.replace(",", "."));
  return result;
}

export function formatZeit(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ns = Math.floor((seconds % 1) * 10);
  return `${m}:${s},${ns}`;
}
