import { expect, waitFor } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import VueUiDigits from '../../src/components/vue-ui-digits.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const { config } = components.find((c) => c.name === 'VueUiDigits');
    cases.RendersAllDigitsAndDecimal = async () => {
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 123456789.01,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(11);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
            }
        }
    };
    cases.Renders0 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 0,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
            }
        }
    };
    cases.Renders1 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 1,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
            }
        }
    };
    cases.Renders2 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 2,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders3 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 3,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders4 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 4,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders5 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 5,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders6 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 6,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders7 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 7,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
            }
        }
    };
    cases.Renders8 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 8,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.Renders9 = async () => {
        {
            await resize(300, 500);
        }
        {
            const mounted = await mountSubject(VueUiDigits, {
                props: {
                    dataset: 9,
                    config,
                },
            });
            let read = () => mounted;
            {
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="digit-decimal"]');
                        expect(elements).toHaveLength(0);
                    });
                }
                {
                    let read = () => select('[data-cy="digit-a"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-b"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-c"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-d"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-e"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#CCCCCCff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-f"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
                {
                    let read = () => select('[data-cy="digit-g"]');
                    await waitFor(() => {
                        expect(read()).not.toHaveLength(0);
                    });
                    await waitFor(() => {
                        expect(read().length).toBeGreaterThan(0);
                        expect(read().some(visible)).toBe(true);
                    });
                    {
                        const previous = read;
                        read = () => previous()[0].getAttribute('fill');
                    }
                    await waitFor(() => {
                        expect(read()).toEqual('#000000ff');
                    });
                }
            }
        }
    };
    cases.LiveValues = async () => {
        const { wrapper } = await mountSubject(VueUiDigits, {
            props: { dataset: 0, config },
        });
        for (const [dataset, expected] of [
            [-12.3, '-12.3'],
            [1e-7, '0.0000001'],
            [1e21, '1000000000000000000000'],
            [Infinity, '0'],
            [NaN, '0'],
            [42, '42'],
        ]) {
            await wrapper.setProps({ dataset });
            await waitFor(() => {
                expect(wrapper.find('.sr-only').text()).toBe(expected);
                expect(wrapper.findAll('[data-cy="digit"]')).toHaveLength(
                    expected.replace('.', '').length,
                );
                expect(
                    wrapper.findAll('[data-cy="digit-decimal"]'),
                ).toHaveLength(expected.includes('.') ? 1 : 0);
            });
            const svg = wrapper.find('svg');
            expect(svg.attributes('aria-describedby')).toBe(
                wrapper.find('.sr-only').attributes('id'),
            );
            expect(svg.html()).not.toMatch(/NaN|Infinity|undefined/);
            expect(
                wrapper
                    .findAll('path')
                    .every((path) =>
                        ['#000000ff', '#CCCCCCff'].includes(
                            path.attributes('fill'),
                        ),
                    ),
            ).toBe(true);
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Mini Charts/VueUiDigits/Interactions',
    render: scenarioRender,
};
export const RendersAllDigitsAndDecimal = {
    name: 'renders all digits and decimal',
    play: async (context) =>
        runScenario(context, createCases, 'RendersAllDigitsAndDecimal'),
};
export const Renders0 = {
    name: 'renders 0',
    play: async (context) => runScenario(context, createCases, 'Renders0'),
};
export const Renders1 = {
    name: 'renders 1',
    play: async (context) => runScenario(context, createCases, 'Renders1'),
};
export const Renders2 = {
    name: 'renders 2',
    play: async (context) => runScenario(context, createCases, 'Renders2'),
};
export const Renders3 = {
    name: 'renders 3',
    play: async (context) => runScenario(context, createCases, 'Renders3'),
};
export const Renders4 = {
    name: 'renders 4',
    play: async (context) => runScenario(context, createCases, 'Renders4'),
};
export const Renders5 = {
    name: 'renders 5',
    play: async (context) => runScenario(context, createCases, 'Renders5'),
};
export const Renders6 = {
    name: 'renders 6',
    play: async (context) => runScenario(context, createCases, 'Renders6'),
};
export const Renders7 = {
    name: 'renders 7',
    play: async (context) => runScenario(context, createCases, 'Renders7'),
};
export const Renders8 = {
    name: 'renders 8',
    play: async (context) => runScenario(context, createCases, 'Renders8'),
};
export const Renders9 = {
    name: 'renders 9',
    play: async (context) => runScenario(context, createCases, 'Renders9'),
};

export const LiveValues = {
    name: 'updates negative, scientific, and nonfinite values',
    play: async (context) => runScenario(context, createCases, 'LiveValues'),
};
