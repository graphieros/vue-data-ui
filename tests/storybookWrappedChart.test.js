import { afterEach, expect, test } from 'vitest';
import { expectWrappedChart } from '../stories/support/wrappedChart';

let canvas, timer;
afterEach(() => {
    clearTimeout(timer);
    canvas?.remove();
});

test('waits for an async chart mounting beyond the default one-second assertion timeout', async () => {
    canvas = document.createElement('div');
    document.body.appendChild(canvas);
    timer = setTimeout(() => {
        canvas.innerHTML = '<div class="vue-ui-dag">Loaded DAG</div>';
    }, 1200);
    await expectWrappedChart(canvas, {
        name: 'VueUiDag',
        wrapperClass: '.vue-ui-dag',
    });
    expect(canvas.querySelector('.vue-ui-dag').textContent).toBe('Loaded DAG');
});

test('requires the mounted chart to become visible, not merely present', async () => {
    canvas = document.createElement('div');
    document.body.appendChild(canvas);
    canvas.innerHTML = '<div class="vue-ui-dag" style="display:none">DAG</div>';
    let madeVisible = false;
    timer = setTimeout(() => {
        canvas.firstElementChild.style.display = '';
        madeVisible = true;
    }, 50);
    await expectWrappedChart(canvas, {
        name: 'VueUiDag',
        wrapperClass: '.vue-ui-dag',
    });
    expect(madeVisible).toBe(true);
});
