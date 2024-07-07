import { parseStilZeiten } from "./eingabe/zeiten";
import * as fs from "node:fs";
import { parseStaffeln } from "./eingabe/staffeln";
import { parseMinMax } from "./eingabe/minmax";
import { parseGeschlechter } from "./eingabe/geschlecht";
import { parseAbwesenheiten } from "./eingabe/abwesenheiten";

const dir = process.argv[2];
const zeiten = parseStilZeiten(fs.readFileSync(`src/main/resources/${dir}_jugend/zeiten.tsv`).toString());
console.log(zeiten);

const staffeln = parseStaffeln(fs.readFileSync(`src/main/resources/staffeln.tsv`).toString());
console.log(staffeln);

const minmax = parseMinMax(fs.readFileSync(`src/main/resources/min_max.tsv`).toString());
console.log(minmax);

const geschlechter = parseGeschlechter(fs.readFileSync(`src/main/resources/geschlecht_${dir}.tsv`).toString());
console.log(geschlechter);

const abwesenheiten = parseAbwesenheiten(fs.readFileSync(`src/main/resources/abwesenheiten_${dir}.tsv`).toString());
console.log(abwesenheiten);
