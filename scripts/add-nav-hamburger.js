/**
 * One-time / maintenance: insert hamburger + backdrop + site-nav into HTML headers.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const pattern = /(      <\/a>)\s*\r?\n(\s*)<nav>/;

const insert = `      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
        <span class="nav-toggle-bar" aria-hidden="true"></span>
        <span class="nav-toggle-bar" aria-hidden="true"></span>
        <span class="nav-toggle-bar" aria-hidden="true"></span>
      </button>
      <div class="nav-backdrop" id="nav-backdrop" hidden></div>
`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".git") continue;
      walk(p, out);
    } else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

let updated = 0;
let skipped = 0;
let nomatch = 0;

for (const file of walk(root)) {
  let t = fs.readFileSync(file, "utf8");
  if (t.includes("nav-toggle")) {
    skipped++;
    continue;
  }
  if (!pattern.test(t)) {
    nomatch++;
    console.warn("no match:", path.relative(root, file));
    continue;
  }
  t = t.replace(pattern, (_, endA, indent) => {
    return `${endA}\n${insert}${indent}<nav id="primary-nav" class="site-nav">`;
  });
  fs.writeFileSync(file, t, "utf8");
  updated++;
  console.log("updated", path.relative(root, file));
}

console.log(`Done. updated=${updated} skipped=${skipped} nomatch=${nomatch}`);
