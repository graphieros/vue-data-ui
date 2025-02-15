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
2. `npm run prod`
3. Run development: `npm run dev`. This step will install a temporary local vue-data-ui
4. Create a new branch: `git checkout -b my-branch-name`.
5. Make your change, add tests, and make sure the tests still pass by running `npm run prod`.
6. Push to your fork and [submit a pull request][pr].

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Write and update tests.
- Keep your changes as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)

### Commit messages examples

- "Fix - {component name} - {description of the fix}"
- "New feature - {component name} - {description of the feature}"

Work in Progress pull requests are also welcome to get feedback early on, or if there is something blocked you.

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
`npm run dev` starts the dev server and serves a page where components are listed (App.vue).

The page shows either 4 or 5 versions of the tested component:

1. responsive version (if applicable) in a resizable container
2. local component
3. local VueDataUi component
4. build component
5. build VueDataUi component

All versions 2 to 5 must be identical after running `npm run prod` then `npm run dev`

The testing arena is pretty raw in terms of layout. Feel free to make it better ;)

### Tests

1. Unit tests (Vitest)

   - `npm run test` to run, add `-w` flag to watch

2. Component tests (Cypress)
   - `npm run test:e2e` to open Cypress
