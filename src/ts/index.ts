import {parseStilZeiten} from "./eingabe/zeiten";
import * as fs from "node:fs";
import {parseStaffeln} from "./eingabe/staffeln";
import {parseMinMax} from "./eingabe/minmax";
import {parseGeschlechter} from "./eingabe/geschlecht";
import {parseAbwesenheiten} from "./eingabe/abwesenheiten";

let dir = process.argv[2];
let zeiten = parseStilZeiten(fs.readFileSync(`src/main/resources/${dir}_jugend/zeiten.tsv`).toString());
console.log(zeiten)

let staffeln = parseStaffeln(fs.readFileSync(`src/main/resources/staffeln.tsv`).toString());
console.log(staffeln)

let minmax = parseMinMax(fs.readFileSync(`src/main/resources/min_max.tsv`).toString());
console.log(minmax)

let geschlechter = parseGeschlechter(fs.readFileSync(`src/main/resources/geschlecht_${dir}.tsv`).toString());
console.log(geschlechter)

let abwesenheiten = parseAbwesenheiten(fs.readFileSync(`src/main/resources/abwesenheiten_${dir}.tsv`).toString());
console.log(abwesenheiten)