const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const root = path.join(__dirname, "..", "dist");
const files = walk(root);
let changed = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const orig = s;
  s = s.split("https://commercialfinancereferrals.com/dist/").join("https://commercialfinancereferrals.com/");
  s = s.split("https://commercialfinancereferrals.com/dist\"").join("https://commercialfinancereferrals.com/\"");
  s = s.split("https://commercialfinancereferrals.com/dist'").join("https://commercialfinancereferrals.com/'");
  if (s !== orig) {
    fs.writeFileSync(f, s);
    changed++;
  }
}
console.log("Updated", changed, "files in dist/");
