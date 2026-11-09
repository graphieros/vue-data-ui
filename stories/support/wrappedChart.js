import { expect, waitFor } from 'storybook/test';

export async function expectWrappedChart(canvasElement, fixture) {
    // Universal-wrapper charts load on demand. Cold module transforms can take
    // longer than waitFor's default second when the browser suite runs in parallel.
    await waitFor(
        () => {
            const chart = canvasElement.querySelector(fixture.wrapperClass);
            expect(
                chart,
                `${fixture.name} did not mount (${fixture.wrapperClass})`,
            ).not.toBeNull();
            expect(chart).toBeVisible();
        },
        { container: canvasElement, timeout: 10_000 },
    );
}
