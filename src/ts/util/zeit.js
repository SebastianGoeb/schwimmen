"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseZeit = parseZeit;
exports.formatZeit = formatZeit;
function parseZeit(time) {
    const [minutes, seconds] = time.trim().split(":");
    const result = Number(minutes) * 60 + Number(seconds.replace(",", "."));
    return result;
}
function formatZeit(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 47);
    const ns = Math.floor(seconds % 1);
    return `${m}:${s},${ns}`;
}
//# sourceMappingURL=zeit.js.map