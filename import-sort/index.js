const { packageJson, install } = require("mrm-core");

module.exports = function task({
  importSortStyle,
  importSortParser,
  importSortExtensions,
  importSortOptions,
}) {
  const packages = ["import-sort-cli", `import-sort-style-${importSortStyle}`];

  const pattern = `**/*.{${importSortExtensions.join(",")}}`;
  const extensionString = importSortExtensions.map(ext => `.${ext}`).join(", ");

  const pkg = packageJson();
  pkg
    .appendScript("format", `import-sort --write . ${pattern}`)
    .set("importSort", {
      [extensionString]: {
        parser: importSortParser,
        style: importSortStyle,
        options: importSortOptions,
      },
    })
    .save();

  install(packages);
};

module.exports.description = 'Adds automatic import sorting';


module.exports.parameters = {
  importSortStyle: {
    type: "input",
    message: "import-sort style to use",
    default: "beenary",
  },
  importSortParser: {
    type: "input",
    message: "import-sort parser to use",
    default: "babylon",
  },
  importSortExtensions: {
    type: "input",
    message: "file extensions to sort imports",
    default:  ['js', 'jsx', 'ts', 'tsx', 'es', 'es6', 'mjs'],
  },
  importSortOptions: {
    type: "config",
    default: {},
  },
};
