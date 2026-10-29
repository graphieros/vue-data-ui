// The static Storybook preview has no Vitest browser runtime. Tests inject
// their browser page through setupFiles; stories retain a live, nullable binding.
export let page = null;

export function setBrowserPage(browserPage) {
    page = browserPage;
}
