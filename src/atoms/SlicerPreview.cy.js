import { ref, reactive } from 'vue';
import SlicerPreview from './SlicerPreview.vue';

const ds = Array.from({ length: 20 }, (_, i) => (i % 2 ? 1 : 0));
const timeLabels = ds.map((_, i) => ({
    absoluteIndex: i,
    text: `____ ${i} ____`,
}));
const preciseLabels = ds.map((_, i) => ({ absoluteIndex: i, text: `P${i}` }));

describe('<SlicerPreview />', () => {
    function mountSlicerPreview(extraProps) {
        const FINAL_CONFIG = reactive({
            style: {
                chart: {
                    zoom: {
                        show: true,
                        color: '#42d392',
                        fontSize: 12,
                        useResetSlot: false,
                        highlightColor: '#3A3A3A',
                        startIndex: null,
                        endIndex: 5,
                        enableRangeHandles: true,
                        enableSelectionDrag: true,
                    },
                    backgroundColor: '#ecf0f1',
                    color: '#333',
                    layout: {
                        grid: {
                            xAxis: {
                                dataLabels: {
                                    values: timeLabels.map((t) => t.text),
                                },
                            },
                        },
                    },
                },
            },
        });

        const maxLength = ref(ds.length);
        const slicerStep = ref(1);
        const slicer = reactive({ start: 0, end: ds.length });

        const events = reactive({
            futureStart: null,
            futureEnd: null,
            updateStart: null,
            updateEnd: null,
            reset: false,
            trapMouse: null,
        });

        const onFutureStart = (v) => (events.futureStart = v);
        const onFutureEnd = (v) => (events.futureEnd = v);
        const onUpdateStart = (v) => (events.updateStart = v);
        const onUpdateEnd = (v) => (events.updateEnd = v);
        const onReset = () => (events.reset = true);
        const onTrapMouse = (v) => (events.trapMouse = v);

        return cy
            .mount({
                components: { SlicerPreview },
                setup() {
                    return {
                        FINAL_CONFIG,
                        maxLength,
                        slicerStep,
                        slicer,
                        minimap: ds,
                        allMinimaps: [
                            {
                                name: 'A',
                                series: ds,
                                color: 'red',
                                id: 'A',
                                isVisible: true,
                            },
                        ],
                        timeLabels,
                        preciseLabels,
                        selectedSeries: { name: 'Serie A' },
                        events,
                        onFutureStart,
                        onFutureEnd,
                        onUpdateStart,
                        onUpdateEnd,
                        onReset,
                        onTrapMouse,
                        ...(extraProps || {}),
                    };
                },
                template: `
                    <div style="background:#f8f9fa; padding:10px;">
                        <SlicerPreview
                            :key="'slicer_' + slicerStep"
                            :background="FINAL_CONFIG.style.chart.zoom.color"
                            :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                            :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                            :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                            :textColor="FINAL_CONFIG.style.chart.color"
                            :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                            :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                            :minimap="minimap"
                            :max="maxLength"
                            :min="0"
                            :valueStart="slicer.start"
                            :valueEnd="slicer.end"
                            v-model:start="slicer.start"
                            v-model:end="slicer.end"
                            :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
                            :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxLength"
                            :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                            :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                            :timeLabels="timeLabels"
                            :preciseLabels="preciseLabels"
                            :usePreciseLabels="false"
                            :selectedSeries="selectedSeries"
                            :allMinimaps="allMinimaps"
                            minimapCompact
                            :minimapMerged="false"
                            @futureStart="onFutureStart"
                            @futureEnd="onFutureEnd"
                            @update:start="onUpdateStart"
                            @update:end="onUpdateEnd"
                            @reset="onReset"
                            @trapMouse="onTrapMouse"
                        />
                    </div>
                `,
            })
            .then(({ wrapper }) => wrapper);
    }

    function pressCompactHandle(side, key, times = 1) {
        const selector = `[data-cy="slicer-compact-handle-${side}"]`;
        let chain = cy.get(selector).should('exist').and('be.visible');

        for (let i = 0; i < times; i += 1) {
            chain = chain.trigger('keydown', {
                eventConstructor: 'KeyboardEvent',
                key,
                bubbles: true,
            });
        }

        return chain;
    }

    it('shows start & end labels on hover', () => {
        mountSlicerPreview();
        cy.get('[data-cy="slicer"]').trigger('mouseenter');
        cy.get('[data-cy="slicer-label-left"]')
            .as('left')
            .should('exist')
            .and('be.visible')
            .and('contain', '____ 0 ____');
        cy.get('[data-cy="slicer-label-right"]')
            .as('right')
            .should('exist')
            .and('be.visible')
            .and('contain', `____ ${ds.length - 1} ____`);
        cy.get('[data-cy="slicer"]').trigger('mouseleave');
        cy.get('@left').should('not.be.visible');
        cy.get('@right').should('not.be.visible');
    });

    it('compact range handles update labels and v-model', () => {
        mountSlicerPreview().then((cmp) => {
            const model = cmp.vm.slicer;

            cy.get('[data-cy="slicer-handle-left"]').should('not.exist');
            cy.get('[data-cy="slicer-handle-right"]').should('not.exist');

            pressCompactHandle('left', 'ArrowRight');

            cy.get('[data-cy="slicer"]').trigger('mouseenter');
            cy.get('[data-cy="slicer-label-left"]').should(
                'contain',
                '____ 1 ____',
            );
            cy.wrap(model).should('have.property', 'start', 1);
            cy.wrap(model).should('have.property', 'end', ds.length);

            // The compact right handle represents the inclusive label index,
            // while the v-model end value is exclusive. 20 -> 9 = 11 steps.
            pressCompactHandle('right', 'ArrowLeft', 11);

            cy.get('[data-cy="slicer-label-right"]').should(
                'contain',
                '____ 8 ____',
            );
            cy.wrap(model).should('have.property', 'start', 1);
            cy.wrap(model).should('have.property', 'end', 9);
        });
    });

    it('merges tooltips when both labels target the same index', () => {
        mountSlicerPreview();

        pressCompactHandle('left', 'ArrowRight', 2);
        // end = 3 means the right label points to inclusive index 2.
        pressCompactHandle('right', 'ArrowLeft', ds.length - 3);

        cy.get('[data-cy="slicer"]').trigger('mouseenter');
        cy.get('[data-cy="slicer-label-merged"]')
            .should('be.visible')
            .and('contain', '____ 2 ____');
        cy.get('[data-cy="slicer-label-left"]').should('not.be.visible');
        cy.get('[data-cy="slicer-label-right"]').should('not.be.visible');
    });

    it('merges the two labels in a single tooltip when tooltips collide (adjacent indices)', () => {
        mountSlicerPreview();

        pressCompactHandle('left', 'ArrowRight', 2);
        // end = 5 means the right label points to inclusive index 4.
        pressCompactHandle('right', 'ArrowLeft', ds.length - 5);

        cy.get('[data-cy="slicer"]').trigger('mouseenter');
        cy.get('[data-cy="slicer-label-merged"]')
            .should('be.visible')
            .and('contain', '____ 2 ____ - ____ 4 ____');
        cy.get('[data-cy="slicer-label-left"]').should('not.be.visible');
        cy.get('[data-cy="slicer-label-right"]').should('not.be.visible');
    });

    it('emits reset when clicking the default reset button (useResetSlot = false)', () => {
        mountSlicerPreview().then((cmp) => {
            const ev = cmp.vm.events;
            cy.get('[data-cy="slicer-reset"]')
                .should('exist')
                .and('be.visible')
                .click({ force: true });
            cy.wrap(ev).its('reset').should('eq', true);
        });
    });

    it('emits trapMouse with the hovered trap index and null on mouseleave', () => {
        mountSlicerPreview().then((cmp) => {
            const ev = cmp.vm.events;
            const targetIndex = 5;

            cy.get('[data-cy="slicer-minimap-svg"]')
                .should(($svg) => {
                    const rect = $svg[0].getBoundingClientRect();
                    const viewBox = $svg[0].getAttribute('viewBox');

                    expect(rect.width).to.be.greaterThan(10);
                    expect(rect.height).to.be.greaterThan(10);
                    expect(viewBox).to.not.equal('0 0 1 1');
                })
                .then(($svg) => {
                    const rect = $svg[0].getBoundingClientRect();
                    const step = rect.width / (ds.length - 1);

                    const clientX = rect.left + step * targetIndex + step * 0.1;
                    const clientY = rect.top + rect.height / 2;

                    cy.get('[data-cy="slicer-minimap-trap"]')
                        .should('exist')
                        .trigger('mousemove', {
                            eventConstructor: 'MouseEvent',
                            clientX,
                            clientY,
                            bubbles: true,
                            force: true,
                        });
                });

            cy.wrap(ev).its('trapMouse').should('eq', targetIndex);

            cy.get('[data-cy="slicer-minimap-trap"]').trigger('mouseleave', {
                eventConstructor: 'MouseEvent',
                bubbles: true,
                force: true,
            });

            cy.wrap(ev).its('trapMouse').should('eq', null);
        });
    });

    it('emits reset when clicking the custom reset slot', () => {
        cy.mount({
            components: { SlicerPreview },
            setup() {
                const ds = Array.from({ length: 20 }, (_, i) =>
                    i % 2 ? 1 : 0,
                );
                const timeLabels = ds.map((_, i) => ({
                    absoluteIndex: i,
                    text: `____ ${i} ____`,
                }));
                const preciseLabels = ds.map((_, i) => ({
                    absoluteIndex: i,
                    text: `P${i}`,
                }));

                const FINAL_CONFIG = reactive({
                    style: {
                        chart: {
                            zoom: {
                                show: true,
                                color: '#42d392',
                                fontSize: 12,
                                useResetSlot: true,
                                highlightColor: '#3A3A3A',
                                startIndex: null,
                                endIndex: 5,
                                enableRangeHandles: true,
                                enableSelectionDrag: true,
                            },
                            backgroundColor: '#ecf0f1',
                            color: '#333',
                            layout: {
                                grid: {
                                    xAxis: {
                                        dataLabels: {
                                            values: timeLabels.map(
                                                (t) => t.text,
                                            ),
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                const maxLength = ref(ds.length);
                const slicerStep = ref(1);
                const slicer = reactive({ start: 0, end: ds.length });

                const events = reactive({
                    reset: false,
                });

                const onReset = () => (events.reset = true);

                return {
                    ds,
                    timeLabels,
                    preciseLabels,
                    FINAL_CONFIG,
                    maxLength,
                    slicerStep,
                    slicer,
                    events,
                    onReset,
                };
            },
            template: `
                <div style="background:#f8f9fa; padding:10px;">
                    <SlicerPreview
                        :key="'slicer_' + slicerStep"
                        :background="FINAL_CONFIG.style.chart.zoom.color"
                        :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                        :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                        :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                        :textColor="FINAL_CONFIG.style.chart.color"
                        :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                        :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                        :minimap="ds"
                        :max="maxLength"
                        :min="0"
                        :valueStart="slicer.start"
                        :valueEnd="slicer.end"
                        v-model:start="slicer.start"
                        v-model:end="slicer.end"
                        :refreshStartPoint="0"
                        :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex + 1"
                        :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                        :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                        :timeLabels="timeLabels"
                        :preciseLabels="preciseLabels"
                        :usePreciseLabels="false"
                        @reset="onReset"
                    >
                        <template #reset-action="{ reset }">
                            <button data-cy="custom-reset" @click="reset">Reset slot</button>
                        </template>
                    </SlicerPreview>
                </div>
            `,
        }).then(({ wrapper }) => {
            cy.get('[data-cy="custom-reset"]')
                .should('exist')
                .click({ force: true });
            cy.wrap(wrapper.vm.events).its('reset').should('eq', true);
        });
    });
});
