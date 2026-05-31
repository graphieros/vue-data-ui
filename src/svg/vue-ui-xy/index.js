import { createVueUiXyState } from './create.js';
import { renderVueUiXySvg } from './render.js';

export async function createStaticVueUiXy(props = {}) {
    return await renderVueUiXySvg(createVueUiXyState(props));
}
