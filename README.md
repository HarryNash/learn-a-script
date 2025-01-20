# Learn A Script

https://learnascript.harrynash.org

## How to set up React + TypeScript + ESLint + Prettier + Husky + VSCode

- Follow this guide but use yarn instead of npm because yarn can resolve the dependency clashes https://leandroaps.medium.com/setting-up-eslint-prettier-and-husky-in-a-typescript-based-react-18-project-a-comprehensive-8a87b91d5a28
- Add the 'Eslint' and 'Prettier Eslint' plugins to VSCode
- Follow the 'Prettier Eslint' plugin installation guide and the troubleshooting steps if necessary
- Remove the Husky stuff you added in the previous guide and add husky following this guide https://typicode.github.io/husky/get-started.html
- Add these steps to prettier then call them in `.husky/pre-commit`:

```
"preparatory_test": "react-scripts test --watchAll=false",
"preparatory_prettier": "prettier --write .",
"preparatory_eslint": "eslint --fix"
```
