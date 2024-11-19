import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as child from "child_process";

const commitHash = child.execSync("git rev-parse --short HEAD").toString().trim();
const worktreeString = child.execSync("git status --porcelain").toString().trim();
const worktreeClean = worktreeString.length === 0;

console.log(worktreeString, worktreeClean);

// https://vitejs.dev/config/
export default defineConfig({
  // make sure to also declare these in vite-env.d.ts
  define: {
    __APP_VERSION__: JSON.stringify(commitHash + (worktreeClean ? "" : "-dirty")),
  },
  plugins: [react()],
});
