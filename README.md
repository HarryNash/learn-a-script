# Done

- Instead of 'Load Sample Script' just load the text in by default
- Save the text you added in a cookie
- Post on reddit

# Setting up react + typescript + eslint + prettier + husky + vscode

- follow this guide but use yarn instead of npm because yarn can resolve the dependency clashes https://leandroaps.medium.com/setting-up-eslint-prettier-and-husky-in-a-typescript-based-react-18-project-a-comprehensive-8a87b91d5a28
- add the 'Eslint' and 'Prettier Eslint' plugins
- follow the 'Prettier Eslint' installation guide and do the troubleshooting section if there is a problem
- Remove the Husky stuff from the guide, and add husky following the guide https://typicode.github.io/husky/get-started.html
- Add these steps to prettier then call them in `.husky/pre-commit`

```
"preparatory_test": "react-scripts test --watchAll=false",
"preparatory_prettier": "prettier --write .",
"preparatory_eslint": "eslint --fix"
```
