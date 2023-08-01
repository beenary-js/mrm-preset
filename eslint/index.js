const eslint = require("mrm-task-eslint");
const { json, packageJson, install } = require("mrm-core");

const baseRules = {
  "consistent-return": "off",
  "no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
  "max-classes-per-file": "off",
  "import/order": [
    "warn",
    {
      groups: [
        "type",
        "builtin",
        "external",
        "internal",
        ["sibling", "parent"],
        "index",
        "unknown",
      ],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
    },
  ],
  "import/prefer-default-export": "off",
  "import/no-default-export": "error",
  "import/extensions": [
    "error",
    "always",
    {
      js: "never",
      jsx: "never",
      ts: "never",
      tsx: "never",
    },
  ],
  "lines-between-class-members": [
    "error",
    "always",
    {
      exceptAfterSingleLine: true,
    },
  ]
}

const reactRules = {
  "react/jsx-props-no-spreading": "off",
  "react/jsx-filename-extension": [
    "error",
    {
      extensions: [".jsx"],
    },
  ],
  "react/function-component-definition": [
    "error",
    {
      namedComponents: "function-declaration",
      unnamedComponents: "arrow-function",
    },
  ],
  "react/destructuring-assignment": "off",
  "react/require-default-props": "off",
  "lines-between-class-members": [
    "error",
    "always",
    {
      exceptAfterSingleLine: true,
    },
  ],
  "jsx-a11y/label-has-associated-control": [
    "error",
    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: "either",
      depth: 25,
    },
  ],
}

const typescriptBaseRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/lines-between-class-members": [
    "warn",
    {
      "exceptAfterSingleLine": true
    }
  ]
}

const typescriptReactRules = {
  "react/jsx-filename-extension": [
    "error",
    {
      extensions: [".tsx"],
    },
  ]
}

const jestRules = {
  "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  "react/function-component-definition": "off",
  "jest/no-disabled-tests": "error",
  "jest/no-focused-tests": "error",
  "jest/no-commented-out-tests": "error",
  "jest/no-identical-title": "error",
  "jest/valid-expect": "error",
  "jest/expect-expect": [
    "error",
    {
      assertFunctionNames: ["expect"],
    },
  ],
  "jest/no-done-callback": "error",
}

const peerDependencies = {
  'eslint-config-airbnb': ['eslint-plugin-import', 'eslint-plugin-react', 'eslint-plugin-react-hooks', 'eslint-plugin-jsx-a11y'],
  'eslint-config-airbnb-base': ['eslint-plugin-import'],
  'eslint-config-airbnb-typescript': ['eslint-plugin-import', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'],
  'eslint-config-airbnb-typescript/base': ['eslint-plugin-import', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'],
}

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
  const pkg = packageJson();
  const isReact = hasPackage(pkg, "react");
  const isTypescript = hasPackage(pkg, "typescript");

  const presets = eslintrc.get("extends") || [];
  const plugins = eslintrc.get("plugins") || [];
  const env = eslintrc.get("env") || {};
  const packages = [];

  const rules = {...baseRules}
  const base = preset(pkg, "airbnb");
  packages.push(...base.package, ...peerDependencies[base.package]);
  presets.push(base.preset);

  if (isReact) {
    Object.assign(rules, reactRules)
  }
  if (isTypescript) {
    const ts = preset(pkg, "airbnb-typescript");
    packages.push(...ts.package, ...peerDependencies[ts.package]);
    presets.push(ts.preset);
    Object.assign(rules, typescriptBaseRules)
  }
  if (isReact && isTypescript) {
    Object.assign(rules, typescriptReactRules)
  }
  if (hasPackage(pkg, "jest")) {
    packages.push("eslint-plugin-jest", "eslint-plugin-testing-library");
    presets.push("jest/recommended", "testing-library/react")
    plugins.push("jest", "testing-library");
    env["jest/globals"] = true;
    Object.assign(rules, jestRules)
  }

  if (presets.includes("prettier")) {
    presets.splice(presets.indexOf("prettier"), 1);
    presets.push("prettier");
  }

  eslintrc.set("extends", Array.from(new Set(presets)));
  eslintrc.set("plugins", Array.from(new Set(plugins)));
  eslintrc.set("env", env);
  eslintrc.save();

  install(packages);
};

module.exports.description = eslint.description;
module.exports.parameters = eslint.parameters;
