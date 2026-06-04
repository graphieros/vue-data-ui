import { createVueUiDonutState } from './create.js';
import { renderVueUiDonutSvg } from './render.js';

export async function createStaticVueUiDonut(props = {}) {
    return await renderVueUiDonutSvg(createVueUiDonutState(props));
}
