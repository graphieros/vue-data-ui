import { expect, waitFor } from 'storybook/test';
import { clickElements, visible } from './scenario.js';
export function commonFeatures(env) {
    const { select, currentWrapper } = env;
    async function testCommonFeatures({
        userOptions = false,
        title = false,
        subtitle = false,
        dataTable = false,
        tooltipCallback = false,
        legend = false,
        slicer = false,
    }) {
        if (userOptions) {
            {
                await waitFor(() => {
                    const elements = select('[data-cy="user-options"]');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
        }
        if (title) {
            {
                await waitFor(() => {
                    const elements = select('.atom-title');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('Title'));
                });
            }
        }
        if (subtitle) {
            {
                await waitFor(() => {
                    const elements = select('.atom-subtitle');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('Subtitle'));
                });
            }
        }
        if (dataTable) {
            await waitFor(() =>
                expect(currentWrapper().vm.$.setupState.tableUnit).toBeTruthy(),
            );
            {
                let read = () => select('[data-cy="user-options-summary"]');
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read());
            }
            {
                let read = () => select('[data-cy="user-options-table"]');
                await waitFor(() => {
                    expect(read()).not.toHaveLength(0);
                });
                await waitFor(() => {
                    expect(read().length).toBeGreaterThan(0);
                    expect(read().some(visible)).toBe(true);
                });
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read());
            }
            {
                await waitFor(() => {
                    const elements = select('.atom-data-table');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
            {
                let read = () => select('[data-cy="data-table-close"]');
                await waitFor(() => {
                    expect(read()).not.toHaveLength(0);
                });
                await waitFor(() => {
                    expect(read().length).toBeGreaterThan(0);
                    expect(read().some(visible)).toBe(true);
                });
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read(), {
                    force: true,
                });
            }
            {
                await waitFor(() => {
                    const elements = select('.atom-data-table');
                    elements.forEach((element) =>
                        expect(element).not.toBeVisible(),
                    );
                });
            }
        }
        if (tooltipCallback) {
            await tooltipCallback();
            {
                let read = () => select('body');
                {
                    const previous = read;
                    read = () =>
                        previous().flatMap((element) =>
                            select('.vue-data-ui-tooltip', element),
                        );
                }
                await waitFor(() => {
                    expect(read()).not.toHaveLength(0);
                });
            }
        }
        if (legend) {
            {
                await waitFor(() => {
                    const elements = select('.vue-data-ui-legend');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
        }
        if (slicer) {
            {
                await waitFor(() => {
                    const elements = select('[data-cy="slicer"]');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
        }
    }
    return testCommonFeatures;
}
