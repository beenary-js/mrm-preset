const eslint = require("mrm-task-eslint");
const { json, packageJson, install } = require("mrm-core");

const hasPackage = (package, name) =>
  package.get(`devDependencies.${name}`) || package.get(`dependencies.${name}`);

const preset = (pkg, name) => {
  const isReact = hasPackage(pkg, "react");
  const preset = `${name}${isReact ? "" : "-base"}`;
  const package = `eslint-config-${preset}`;
  return { preset, package };
};

module.exports = function task(...args) {
  eslint(...args);
  const eslintrc = json(".eslintrc.json");
  const presets = eslintrc.get("extends");
  const pkg = packageJson();

  const base = preset(pkg, "beenary");
  const packages = [base.package];
  presets.push(base.preset);

  if (hasPackage(pkg, "typescript")) {
    const typescript = preset(pkg, "beenary-typescript");
    packages.push(typescript.package);
    presets.push(typescript.preset);
  }
  if (hasPackage(pkg, "jest")) {
    const jest = preset(pkg, "beenary-jest");
    packages.push(jest.package);
    presets.push(jest.preset);
  }

  if (presets.includes("prettier")) {
    presets.splice(presets.indexOf("prettier"), 1);
    presets.push("prettier");
  }

  eslintrc.set("extends", presets);
  eslintrc.save();
  install(packages);
};

module.exports.description = eslint.description;
module.exports.parameters = eslint.parameters;
