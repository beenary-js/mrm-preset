const fs = require("fs");
const { lines } = require("mrm-core");

module.exports = function task() {
  const remove = ["node_modules"];
  const addStr = `
# dependencies
node_modules/

# eslint
.eslintcache

# IDE
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# typescript
*.tsbuildinfo

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# docker
docker-compose.override.yml

# misc
.DS_Store
Thumbs.db
  `;

  const add = addStr.split("\n");

  const pmAdd = [];
  // If project uses npm, ignore yarn.lock and pnpm-lock.yaml
  if (fs.existsSync("package-lock.json")) {
    pmAdd.push("yarn.lock");
    pmAdd.push("pnpm-lock.yaml");
    remove.push("package-lock.json");
  }

  // If project uses Yarn, ignore package-lock.json and pnpm-lock.yaml
  if (fs.existsSync("yarn.lock")) {
    remove.push("yarn.lock");
    pmAdd.push("package-lock.json");
    pmAdd.push("pnpm-lock.yaml");
  }

  // If project uses pnpm, ignore package-lock.json and yarn.lock
  if (fs.existsSync("pnpm-lock.yaml")) {
    remove.push("pnpm-lock.yaml");
    pmAdd.push("yarn.lock");
    pmAdd.push("package-lock.json");
  }
  if (pmAdd.length) {
    pmAdd.unshift("# other package managers");
    pmAdd.push("\n");
    add.push(...pmAdd);
  }

  const tvmAdd = [];
  // If project uses .node-version, ignore .nvmrc and .tool-versions
  if (fs.existsSync(".node-version")) {
    remove.push(".node-version");
    tvmAdd.push(".nvmrc");
    tvmAdd.push(".tool-versions");
  }

  // If project uses .nvmrc, ignore .node-version and .tool-versions
  if (fs.existsSync(".nvmrc")) {
    remove.push(".nvmrc");
    tvmAdd.push(".node-version");
    tvmAdd.push(".tool-versions");
  }

  // If project uses .tool-versions, ignore .node-version and .nvmrc
  if (fs.existsSync(".tool-versions")) {
    remove.push(".tool-versions");
    tvmAdd.push(".node-version");
    tvmAdd.push(".nvmrc");
  }
  if (tvmAdd.length) {
    tvmAdd.unshift("# other version managers");
    tvmAdd.push("\n");
    add.push(...tvmAdd);
  }

  // .gitignore
  lines(".gitignore").remove(remove).add(add).save();
};

module.exports.description = "Adds .gitignore";
