## Contributing

[fork]: /fork
[pr]: /compare
[style]: https://standardjs.com/
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Issues and PRs

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! We'd love all and any contributions. If you have questions, too, we'd love to hear them.

We'd also love PRs. If you're thinking of a large PR, we advise opening up an issue first to talk about it, though! Look at the links below if you're not sure how to open a PR.

## Submitting a pull request

0. [Fork][fork] and clone the repository.
1. Configure and install the dependencies: `npm install`.
2. `npm run prod`. Will run all the tests and build the package. (See the [Troubleshooting](#troubleshooting) section below if you encounter errors here.)
3. cd into `manual-testing`
4. `npm install` in the manual-testing directory
5. `npm run dev` in the manual-testing directory: will hook the local build of the library to the testing app.
6. Create a new branch: `git checkout -b my-branch-name`.
7. Make your change, add tests, and make sure the tests still pass by running `npm run prod` from the root directory.
8. Push to your fork and [submit a pull request][pr].

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Write and update tests.
- Keep your changes as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)

### Commit messages examples

- "Fix - {component name} - {description of the fix}"
- "New feature - {component name} - {description of the feature}"

Work in Progress pull requests are also welcome to get feedback early on, or if there is something that has blocked you.

### Troubleshooting

- While working with either native Linux or Windows/WSL2, you may encounter an error of the following type after running `npm run prod`:

```
It looks like this is your first time using Cypress: 15.12.0

✖ Cypress failed to start.
  This may be due to a missing library or dependency. https://on.cypress.io/required-dependencies
  Please refer to the error below for more details.
  ----------
  /<HOME_DIRECTORY>/<YOUR_COMPUTER_NAME>/.cache/Cypress/15.12.0/Cypress/Cypress: error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory
  ----------
  Platform: linux-x64 (Ubuntu - 24.04.3 LTS)
  Cypress Version: 15.12.0
```

This can be resolved by running the following commands in your terminal:

```
sudo apt-get update
sudo apt-get install -y libnspr4 libnss3 libxss1 libasound2t64 libatk-bridge2.0-0 libgtk-3-0 libgbm1
```

After which `npm run prod` should run correctly.

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [GitHub Help](https://help.github.com)

## Adding new features

### Configuration

All components of the library use a configuration object holding default values, allowing the user to provide the config prop with only the attributes they need to tweak.

If a feature requires additional default configuration:

1. update the `useConfig.js` file
2. update the types in `vue-data-ui.d.ts` file
3. update the testing arena with the new config items

### Adding slots, emits, exposed methods

When adding features involving slots, emits or exposed methods, please update the README file under the components section.

### Updating the vue-data-ui universal component

The VueDataUi universal component can be the sole component imported by users. It will async import the selected component, making a lighter use of the library.

If a feature added in a component requires the addition of a new emit or a new exposed method, they need to be referenced in the vue-data-ui.vue component.

### Updating the testing arena

The testing arena provides a quick way to visually test changes made on components, and toggle inputs to test configs.
cd into the `manual-testing` directory and run `npm run dev` to start the dev server.

Each page shows several versions of the tested component:

1. responsive version (if applicable) in a resizable container
2. local component
3. local VueDataUi component
4. build component
5. build VueDataUi component

All versions 2 to 5 must be identical after running `npm run prod` in the root directory then `npm run dev` in the `manual-testing` directory.

The testing arena is pretty raw in terms of layout. Feel free to make it better ;)

### Tests

1. Unit tests (Vitest)
    - `npm run test` to run from the root directory, add `-w` flag to watch

2. Component tests (Cypress, Component testing)
    - `npm run test:e2e` from the root directory to open Cypress
