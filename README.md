# Done

- I enter my script in a box
- I click a button to commence
- The script in a box disappears from sight
- It runs through each line in the script
  - If I get it 100% correct then display a joyous gif and continue
  - If I get it 95%> correct then display a pleased gif with a git diff showing my mistake, conceal the git diff whilst there is new text in the box
  - If I get it <95% correct then display a sad gif with a git diff showing my mistake, conceal the git diff whilst there is new text in the box
- Add label for textfield eg "Line 3/10"
- Display time worked
- Add nice icon
- Add nice title
- Stop 1password
- Deploy it
- Add link to my Linktree at the bottom
- Add sound
- Highlight instead of change colour to make it clearer where the problems are
- Make it so gif fades don't intertwine
- Add button to load in a sample script (king icon) "A horse! A horse! My kingdom for a horse!" (this is convenient for testing it on a phone)
- Pop up the percentage correctness along with the gif
- Display total accuracy correctly of first attempts
- Say try again if you're beneath the threshold
- Stop showing first pass accuracy after you've restarted

# Things this should have

- Add a gear to configure whether we care about sound, punctuation, case and minimum percentage correctness
- Display hours, minutes, seconds instead of seconds
- Link a proper URL on AWS
- Add that real link to my LinkTree
- Post on reddit

# Extras

- Have a starter-mode where it displays a random selection of half the words

# Setting up react + typescript + eslint + prettier + husky + vscode

- follow this guide but use yarn instead of npm because yarn can resolve the dependency clashes https://leandroaps.medium.com/setting-up-eslint-prettier-and-husky-in-a-typescript-based-react-18-project-a-comprehensive-8a87b91d5a28
- add the Prettier Eslint plugin
- Remove the Husky stuff from the guide, and add husky following the guide https://typicode.github.io/husky/get-started.html
- Add these steps to prettier then call them in `.husky/pre-commit`

```
"preparatory_test": "react-scripts test --watchAll=false",
"preparatory_prettier": "prettier --write .",
"preparatory_eslint": "eslint --fix"
```
