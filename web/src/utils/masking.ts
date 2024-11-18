function padTwoDigits(n: number): string {
  return n.toString().padStart(2, "0");
}
export function formatMaskedTime(seconds: number): string {
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = Math.floor(seconds % 60);
  const centsPart = Math.round((seconds % 1) * 100);
  return `${padTwoDigits(minutesPart)}:${padTwoDigits(secondsPart)},${padTwoDigits(centsPart)}`;
}

export function parseMaskedZeitToSeconds(zeit: string): number | undefined {
  const cleaned = zeit.replace(/[:,]/g, "");
  if (cleaned === "" || cleaned == "______") {
    return undefined;
  }

  // TODO handle partially filled strings (e.g. 12:_5,10) with error
  const cleaned2 = cleaned.replace(/_/g, "0");

  const min = Number(cleaned2.slice(0, 2));
  const sec = Number(cleaned2.slice(2, 4));
  const cent = Number(cleaned2.slice(4, 6));

  return min * 60 + sec + cent / 100;
}
