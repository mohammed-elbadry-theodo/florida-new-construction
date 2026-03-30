const configGeneratorComponent = {
  description: "this is next boilerplate component generator",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "component name please",
    },
  ],
  actions: [
    {
      type: "add",
      path: "src/components/{{camelCase name}}/{{pascalCase name}}.tsx",
      templateFile: "src/__plop__//ComponentReact.hbs",
    },
    {
      type: "add",
      path: "src/components/{{camelCase name}}/index.ts",
      templateFile: "src/__plop__//index.hbs",
    },
    {
      type: "add",
      path: "src/components/{{camelCase name}}/{{pascalCase name}}.style.ts",
    },
  ],
};

const configGeneratorPage = {
  description: "this is next boilerplate page generator",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "page name please",
    },
  ],
  actions: [
    {
      type: "add",
      path: "src/pages/{{camelCase name}}.tsx",
      templateFile: "src/__plop__//Page.hbs",
    },
  ],
};

module.exports = function configure(plop) {
  plop.setGenerator("component", configGeneratorComponent);
  plop.setGenerator("page", configGeneratorPage);
};
