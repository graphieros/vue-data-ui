import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiChestnut from '../src/components/vue-ui-chestnut.vue';
const dataset = [
    {
        id: 'r1',
        name: 'Small',
        branches: [
            {
                id: 'b1',
                name: 'Branch',
                value: 10,
                breakdown: [{ id: 'n1', name: 'Nut', value: 10 }],
            },
        ],
    },
    {
        id: 'r2',
        name: 'Large',
        branches: [
            {
                id: 'b2',
                name: 'Other',
                value: 30,
                breakdown: [{ id: 'n2', name: 'Other nut', value: 30 }],
            },
        ],
    },
];
beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 123),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
const mountChart = (props = {}) =>
    mount(
        { ...VueUiChestnut, render: () => null },
        { props: { dataset, ...props } },
    );

test('layout sorting leaves exposed data and input order stable', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.roots.map((r) => r.id)).toEqual(['r2', 'r1']);
        expect(wrapper.vm.getData().map((r) => r.id)).toEqual(['r1', 'r2']);
        expect(dataset.map((r) => r.id)).toEqual(['r1', 'r2']);
        expect(state.table.body.map((row) => row.rootName)).toEqual([
            'Large',
            'Small',
        ]);
    } finally {
        wrapper.unmount();
    }
});

test('height follows data and skeleton transitions', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.svg.height).toBe(274);
        await wrapper.setProps({ dataset: [dataset[0]] });
        expect(state.svg.height).toBe(236);
        await wrapper.setProps({ config: { loading: true } });
        await flushPromises();
        expect(state.svg.height).toBe(502);
        await wrapper.setProps({ config: { loading: false } });
        await flushPromises();
        expect(state.svg.height).toBe(236);
    } finally {
        wrapper.unmount();
    }
});

test('zero totals produce finite radii, widths and proportions', async () => {
    const wrapper = mountChart({
        dataset: [
            {
                name: 'Zero',
                branches: [
                    {
                        name: 'Zero branch',
                        value: 0,
                        breakdown: [{ name: 'Zero nut', value: 0 }],
                    },
                ],
            },
        ],
    });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.roots[0].r).toBe(16);
        expect(state.branches[0].x2 - state.branches[0].x1).toBe(0);
        const branch = wrapper.vm.getData()[0].branches[0];
        expect(branch.proportionToRoot).toBe(0);
        expect(branch.breakdown[0].proportionToBranch).toBe(0);
        expect(
            Object.values(branch.breakdown[0].table)
                .filter((v) => typeof v === 'number')
                .every(Number.isFinite),
        ).toBe(true);
        expect(
            state.miniDonuts
                .get(branch.id)
                .every((arc) => !arc.path.includes('NaN')),
        ).toBe(true);
    } finally {
        wrapper.unmount();
    }
});

test('raw totals and clamped negative values retain their separate meanings', async () => {
    const wrapper = mountChart({
        dataset: [
            {
                name: 'Mixed',
                branches: [
                    {
                        name: 'Positive',
                        value: 10,
                        breakdown: [{ name: 'N', value: -2 }],
                    },
                    { name: 'Negative', value: -5 },
                ],
            },
        ],
    });
    try {
        await flushPromises();
        const root = wrapper.vm.getData()[0];
        expect(root.total).toBe(5);
        expect(root.branches.map((b) => b.value)).toEqual([10, 0]);
        expect(root.branches[0].breakdown[0].value).toBe(0);
        expect(root.branches[0].breakdown[0].table.nutValue).toBe(-2);
        expect(wrapper.vm.$.setupState.maxRoot).toBe(10);
    } finally {
        wrapper.unmount();
    }
});

test('table and CSV grouping distinguish equally named roots and branches', async () => {
    const roots = [0, 1].map((i) => ({
        name: 'Same root',
        branches: [0, 1].map((j) => ({
            name: 'Same branch',
            value: 10,
            breakdown: [{ name: `Nut ${i}-${j}`, value: 10 }],
        })),
    }));
    const wrapper = mountChart({ dataset: roots });
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        expect(state.tableDisplayRows[1][0]).toBe('');
        expect(state.tableDisplayRows[1][3]).toBe('Same branch');
        expect(state.tableDisplayRows[2][0]).toBe('Same root');
        expect(state.tableDisplayRows[2][3]).toBe('Same branch');
        const csv = await new Promise((resolve) =>
            wrapper.vm.generateCsv(resolve),
        );
        expect(csv.match(/Same root/g)).toHaveLength(2);
        expect(csv.match(/Same branch/g)).toHaveLength(4);
    } finally {
        wrapper.unmount();
    }
});

test('reset cancels a queued nut selection', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.pickNut(state.branches[0]);
        state.resetChart();
        await nextTick();
        expect(state.selectedNut).toBeNull();
        expect(state.openNut).toBeNull();
        expect(wrapper.emitted('selectNut')).toBeUndefined();
    } finally {
        wrapper.unmount();
    }
});

test('selection rebinds updated data and clears removed branches', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        state.pickNut(state.branches.find((b) => b.id === 'b1'));
        await nextTick();
        await wrapper.setProps({
            dataset: [
                {
                    ...dataset[0],
                    branches: [
                        {
                            ...dataset[0].branches[0],
                            value: 20,
                            breakdown: [
                                { id: 'n1', name: 'Updated', value: 20 },
                            ],
                        },
                    ],
                },
                dataset[1],
            ],
        });
        expect(state.selectedNut.value).toBe(20);
        expect(state.openNut[0].name).toBe('Updated');
        await wrapper.setProps({ dataset: [dataset[1]] });
        expect(state.selectedNut).toBeNull();
        expect(state.selectedBranch).toBeNull();
        expect(state.accessibilityCursor.rootIndex).toBe(0);
        expect(state.accessibilityCursor.branchIndex).toBe(0);
        expect(state.openNut).toBeNull();
    } finally {
        wrapper.unmount();
    }
});

test('selection reuses cached mini donuts and link geometry', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        const state = wrapper.vm.$.setupState;
        const donuts = state.miniDonuts;
        const paths = state.linkPaths;
        state.pickRoot(state.roots[0]);
        expect(state.miniDonuts).toBe(donuts);
        expect(state.linkPaths).toBe(paths);
        state.pickNut(state.branches[0]);
        await nextTick();
        expect(state.miniDonuts).toBe(donuts);
        expect(state.linkPaths).toBe(paths);
    } finally {
        wrapper.unmount();
    }
});

test('table visibility is safe before its component mounts', async () => {
    const wrapper = mountChart();
    try {
        await flushPromises();
        wrapper.vm.toggleTable();
        await nextTick();
        wrapper.vm.toggleTable();
        await nextTick();
        expect(wrapper.vm.$.setupState.mutableConfig.showTable).toBe(false);
    } finally {
        wrapper.unmount();
    }
});

test('unmount invalidates queued detail selection without emitting', async () => {
    const wrapper = mountChart();
    await flushPromises();
    wrapper.vm.$.setupState.pickNut(wrapper.vm.$.setupState.branches[0]);
    wrapper.unmount();
    await nextTick();
    expect(wrapper.emitted('selectNut')).toBeUndefined();
});

test('rendered table keeps repeated hierarchy names in distinct groups', async () => {
    const roots = [0, 1].map((i) => ({
        name: 'Same root',
        branches: [
            {
                name: 'Same branch',
                value: 10,
                breakdown: [{ name: `Nut ${i}`, value: 10 }],
            },
        ],
    }));
    const wrapper = mount(VueUiChestnut, {
        props: {
            dataset: roots,
            config: { table: { show: true, useDialog: false } },
        },
    });
    try {
        await flushPromises();
        await vi.dynamicImportSettled();
        await flushPromises();
        const rows = wrapper.findAll('[data-cy="chestnut-table"] tbody tr');
        expect(rows).toHaveLength(2);
        for (const row of rows) {
            const cells = row.findAll('td');
            expect(cells).toHaveLength(12);
            expect(cells[0].text()).toBe('Same root');
            expect(cells[3].text()).toBe('Same branch');
        }
    } finally {
        wrapper.unmount();
    }
});

test('nut announcements honor selected value and percentage precision', async () => {
    const wrapper = mountChart({
        config: {
            style: {
                chart: {
                    layout: {
                        nuts: {
                            selected: {
                                roundingValue: 2,
                                roundingPercentage: 1,
                            },
                        },
                    },
                },
            },
        },
    });
    try {
        const state = wrapper.vm.$.setupState;
        const announcement = state.getNutAnnouncement({
            name: 'Nut',
            branchName: 'Branch',
            rootName: 'Root',
            value: 12.3456,
            proportionToBranch: 0.123456,
        });
        expect(announcement).toContain('12.35');
        expect(announcement).toContain('12.3%');
    } finally {
        await flushPromises();
        wrapper.unmount();
    }
});
