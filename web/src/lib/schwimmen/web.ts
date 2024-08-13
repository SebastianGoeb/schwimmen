import { runCrappySimulatedAnnealing } from "./search/sa/crappy-simulated-annealing";
import { parseSheet } from "./eingabe/sheet";
import { isError } from "./util/error";
import { formatSheet } from "./ausgabe/sheet";
import styles from "./index.css";

function sliceSheet(sheet: string[][], startCol: string, endCol: string) {
  console.log(startCol.charCodeAt(0) - 65, endCol.charCodeAt(0) - 64);
  return sheet
    .map((row) => row.slice(startCol.charCodeAt(0) - 65, endCol.charCodeAt(0) - 64))
    .filter((row) => !row.every((cell) => cell.length === 0));
}

async function runSearch() {
  const response = await fetch("assets/together.tsv");
  const text = await response.text();
  const sheet = text.split("\n").map((row) => row.split("\t"));
  const parsed = parseSheet(sheet);
  if (isError(parsed)) {
    console.error(parsed.errors);
    return;
  }

  const { state, duration, checked } = await runCrappySimulatedAnnealing(parsed.konfiguration, parsed.hyperparameters);
  console.log(state, duration, checked, `${Math.floor(checked / duration).toLocaleString()}/s`);
  const ausgabe = formatSheet(parsed.konfiguration, state, duration, checked, [], 4);
  console.log(ausgabe.map((row) => row.join("\t")).join("\n"));
  renderTable(ausgabe);
}

function renderTable(data: (string | undefined)[][]) {
  const table = document.createElement("table");
  data.map((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      if (cell !== undefined) {
        td.textContent = cell;
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  document.body.appendChild(table);
}

console.log(styles);
runSearch();
