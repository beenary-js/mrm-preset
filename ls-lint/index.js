const { yaml, packageJson, install } = require("mrm-core");

const baseRules = {
  ".config.js": "kebab-case",
  ".json": "kebab-case | regex:.[a-z0-9-]+",

  ".yml": "kebab-case | regex:.[a-z0-9-]+",
  ".yaml": "kebab-case | regex:.[a-z0-9-]+",

  ".js": "kebab-case",
  ".jsx": "kebab-case",
  ".test.js": "kebab-case",
  ".test.jsx": "kebab-case",

  ".css": "kebab-case",
  ".scss": "kebab-case",
  ".sass": "kebab-case",
  ".module.css": "kebab-case",

  ".md": "SCREAMING_SNAKE_CASE",

  ".dir": "kebab-case",
};

const ignore = [
  "node_modules",
  "dist",
  ".husky",
  ".git",
  ".history",
  ".idea",
  "Taskfile.*",
  "Dockerfile",
];

module.exports = function task() {
  const packages = ["@ls-lint/ls-lint"];

  const pkg = packageJson();
  const isTypeScript =
    pkg.get("devDependencies.typescript") || pkg.get("dependencies.typescript");

  const rules = Object.assign({}, baseRules);
  if (isTypeScript) {
    rules[".ts"] = "kebab-case";
    rules[".tsx"] = "kebab-case";
    rules[".test.ts"] = "kebab-case";
    rules[".test.tsx"] = "kebab-case";
    rules[".d.ts"] = "kebab-case";
  }

  const config = { ls: rules, ignore };
  yaml(".ls-lint.yml").merge(config).save();

  pkg.setScript("lint:fs", `ls-lint`).save();
  pkg.appendScript("lint", `npm run lint:fs`).save();
  install(packages);
};

module.exports.description = "Adds ls-lint";
