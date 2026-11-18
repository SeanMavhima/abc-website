// Runs the Next.js CLI with a normalised working directory.
//
// On Windows, starting Next.js from a path with a lowercase drive letter
// (for example "c:\Users\..." — the form VS Code's terminal uses) breaks the
// React client manifest: client components fail to load ("Could not find the
// module ... in the React Client Manifest"), so pages render without any
// interactivity and admin editors misbehave. Re-launching with an uppercase
// drive letter avoids it. On other platforms this is a plain pass-through.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

let cwd = process.cwd();
if (process.platform === "win32" && /^[a-z]:/.test(cwd)) {
  cwd = cwd[0].toUpperCase() + cwd.slice(1);
}

// Resolve Next.js from the normalised directory too, so its own module paths
// (and therefore the paths of its webpack loaders) use the same drive casing.
const nextBin = createRequire(path.join(cwd, "package.json")).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], { cwd, stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
