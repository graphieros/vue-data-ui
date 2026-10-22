## Contributing

[fork]: /fork
[pr]: /compare
[style]: https://standardjs.com/
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## AI-assisted contributions

- Please read our [AI policy](./AI_POLICY.md) before contributing

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
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) and use the [Conventional Commits](https://www.conventionalcommits.org/) format.
- Use same format for PR titles as for commit messages.

### Commit messages examples

- "fix: {component name} - {description of the fix}"
- "feat: {component name} - {description of the feature}"
- "chore(deps): {description of the dependency update}"
- "refactor(css): {description of the css fix}"

Work in Progress pull requests are also welcome to get feedback early on, or if there is something that has blocked you.

### Browser test setup

Install Chromium once after installing dependencies:

```sh
npx playwright install chromium
```

On Linux CI, install the required system libraries too with
`npx playwright install --with-deps chromium`.

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

### Tests and component development

Storybook is the primary component development and interaction testing environment.
The testing arena remains available to compare source components with package builds.

```sh
npm run storybook        # interactive catalog at localhost:6006
npm run build:storybook  # static site in storybook-static/
npm run test:unit        # existing Vitest unit tests (jsdom)
npm run test:storybook   # Storybook play functions in headless Chromium
npm run test:all         # both suites
npm run prod             # formatting, types, both suites, production build
```

Add stories under `stories/`, using the existing component family titles. Import
components from `src/` so a package build is not required. Keep datasets deterministic;
shared fixture data and clone helpers live in `stories/fixtures/` and `stories/support/`.
Use `args` and `argTypes` for editable dataset and config controls. Add separate stories
for important configurations, empty/loading states, slots, and emitted events.

Write assertions in an async `play` function with `expect`, `fn`, `waitFor`, and
`userEvent` from `storybook/test`. Prefer `canvas.getByRole` and accessible names;
existing `data-cy` attributes remain stable selectors for SVG geometry. Await
interactions and poll observable state instead of adding fixed sleeps.

```js
import { expect, fn } from 'storybook/test';

export const Selectable = {
    args: { onSelectLegend: fn() },
    play: async ({ canvas, args, userEvent }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Series 1' }));
        await expect(args.onSelectLegend).toHaveBeenCalled();
    },
};
```

The migrated scenarios use a Vue Test Utils canvas harness when they need exposed
methods, emitted payloads, remounts, or reactive parent models. It unmounts components,
restores spies, and removes teleports after each story. New stories can normally use
Storybook's declarative `component` and `args` rendering directly.

CI installs Chromium and runs both suites before publishing. Storybook configuration
is separate from the library build; only `dist/` is published. See
[the migration coverage map](./docs/storybook-migration.md) for the previous spec to
story mapping and details of assertion adaptations.
