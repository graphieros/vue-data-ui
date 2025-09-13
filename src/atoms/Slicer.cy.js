import { ref, reactive } from "vue";
import Slicer from "./Slicer.vue";

const ds = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]

describe("<Slicer />", () => {
    function mountSlicer() {
        const FINAL_CONFIG = reactive({
            style: {
                chart: {
                    zoom: {
                        show: true,
                        color: "#42d392",
                        fontSize: 12,
                        useResetSlot: false,
                        highlightColor: "#3A3A3A",
                        startIndex: null,
                        endIndex: 5,
                        enableRangeHandles: true,
                        enableSelectionDrag: true,
                    },
                    backgroundColor: "#ecf0f1",
                    color: "#333",
                    layout: {
                        grid: {
                            xAxis: {
                                dataLabels: {
                                    values: ds.map((d,i) => {
                                        return `____ ${i} ____`
                                    }),
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

        return cy.mount({
            components: { Slicer },
            setup() {
                return {
                    FINAL_CONFIG,
                    maxLength,
                    slicerStep,
                    slicer,
                    minimap: ds,
                    events,
                    onFutureStart,
                    onFutureEnd,
                    onUpdateStart,
                    onUpdateEnd,
                    onReset,
                    onTrapMouse,
                };
            },
            template: `
        <div style="background: #f8f9fa; padding: 10px;">
            <Slicer
                ref="slicerComponent"
                :key="'slicer_' + slicerStep"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :labelLeft="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(slicer.start)] || ''"
                :labelRight="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(slicer.end) - 1] || ''"
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
                @futureStart="onFutureStart"
                @futureEnd="onFutureEnd"
                @update:start="onUpdateStart"
                @update:end="onUpdateEnd"
                @reset="onReset"
                @trapMouse="onTrapMouse"
            />
        </div>
    `,
        }).then(({ wrapper }) => wrapper);
    }

    it('shows start & end labels on hover', () => {
        mountSlicer();
        cy.get('[data-cy="slicer"]').trigger('mouseenter')
        cy.get('[data-cy="slicer-label-left"]').as('left').should('exist').and('be.visible').and('contain', '____ 0 ____')
        cy.get('[data-cy="slicer-label-right"]').as('right').should('exist').and('be.visible').and('contain', `____ ${ds.length-1} ____`)
        cy.get('[data-cy="slicer"]').trigger('mouseleave')
        cy.get('@right').should('not.be.visible')
        cy.get('@left').should('not.be.visible')
    });

    it("uses range handles and updates bounds", () => {
        mountSlicer().then((cmp) => {
            const slicer = cmp.vm.slicer;

            cy.get('[data-cy="slicer-handle-left"]')
                .invoke("val", 1)
                .trigger("input", { force: true });

            cy.get('[data-cy="slicer-handle-right"]')
                .invoke("val", 8)
                .trigger("input", { force: true });

            cy.wrap(slicer).should('have.property', 'start', 1);
            cy.wrap(slicer).should('have.property', 'end', 8);
            cy.get('[data-cy="slicer"]').trigger('mouseenter')
            cy.get('[data-cy="slicer-label-left"]').as('left').should('exist').and('be.visible').and('contain', '____ 1 ____')
            cy.get('[data-cy="slicer-label-right"]').as('right').should('exist').and('be.visible').and('contain', '____ 7 ____')
        });
    });

    it('drags selection and updates bounds from the minimap', () => {
        mountSlicer().then(cmp => {
            const slicer = cmp.vm.slicer;
            cy.get('[data-cy="slicer-handle-left"]')
                .invoke("val", 2)
                .trigger("input", { force: true });

            cy.get('[data-cy="slicer-handle-right"]')
                .invoke("val", 10)
                .trigger("input", { force: true });

            cy.wait(100)
            cy.get('[data-cy="slicer-minimap-selection-rect"]')
                .trigger('mousedown', { force: true })
                .trigger('mousemove', {force: true, clientX: 400 })

            cy.wrap(slicer).should('have.property', 'start', 12);
            cy.wrap(slicer).should('have.property', 'end', 20);
            cy.get('[data-cy="slicer-label-left"]').as('left').should('exist').and('be.visible').and('contain', '____ 12 ____')
            cy.get('[data-cy="slicer-label-right"]').as('right').should('exist').and('be.visible').and('contain', '____ 19 ____')
        })
    })

    it('drags selection and updates bounds from the range highlight', () => {
        mountSlicer().then(cmp => {
            const slicer = cmp.vm.slicer;
            cy.get('[data-cy="slicer-handle-left"]')
                .invoke("val", 2)
                .trigger("input", { force: true });

            cy.get('[data-cy="slicer-handle-right"]')
                .invoke("val", 10)
                .trigger("input", { force: true });

            cy.wait(100)
            cy.get('[data-cy="slicer-range-highlight"]')
                .trigger('mousedown', { force: true })
                .trigger('mousemove', {force: true, clientX: 400 })

            cy.wrap(slicer).should('have.property', 'start', 12);
            cy.wrap(slicer).should('have.property', 'end', 20);
            cy.get('[data-cy="slicer-label-left"]').as('left').should('exist').and('be.visible').and('contain', '____ 12 ____')
            cy.get('[data-cy="slicer-label-right"]').as('right').should('exist').and('be.visible').and('contain', '____ 19 ____')
        })
    })

    it('merges tooltips when they collide on the same index', () => {
        mountSlicer().then(cmp => {
            cy.get('[data-cy="slicer-handle-left"]')
                .invoke("val", 2)
                .trigger("input", { force: true });

            cy.get('[data-cy="slicer-handle-right"]')
            .invoke("val", 2)
            .trigger("input", { force: true });

            cy.wait(100)
            cy.get('[data-cy="slicer-range-highlight"]')
                .trigger('mousedown', { force: true })
                .trigger('mousemove', {force: true, clientX: 400 })

            cy.get('[data-cy="slicer-label-merged"]').should('be.visible').and('contain', '____ 17 ____')
            cy.get('[data-cy="slicer-label-left"]').should('not.be.visible')
            cy.get('[data-cy="slicer-label-right"]').should('not.be.visible')
        })
    })

    it('merges the two labels in a single tooltip when tooltips collide', () => {
        mountSlicer().then(cmp => {
            cy.get('[data-cy="slicer-handle-left"]')
                .invoke("val", 2)
                .trigger("input", { force: true });

            cy.get('[data-cy="slicer-handle-right"]')
            .invoke("val", 4)
            .trigger("input", { force: true });

            cy.wait(100)
            cy.get('[data-cy="slicer-range-highlight"]')
                .trigger('mousedown', { force: true })
                .trigger('mousemove', {force: true, clientX: 400 })

            cy.get('[data-cy="slicer-label-merged"]').should('be.visible').and('contain', '____ 16 ____ - ____ 17 ____');
            cy.get('[data-cy="slicer-label-left"]').should('not.be.visible')
            cy.get('[data-cy="slicer-label-right"]').should('not.be.visible')
        })
    });

    it("emits trapMouse with the hovered trap index and null on mouseleave", () => {
        mountSlicer().then((cmp) => {
            const ev = cmp.vm.events;

            cy.get('[data-cy="minimap"] svg [style*="pointer-events: all"]')
                .eq(5)
                .trigger("mouseenter", { force: true });

            cy.wrap(ev).its("trapMouse").should("eq", 5);

            cy.get('[data-cy="minimap"] svg [style*="pointer-events: all"]')
                .eq(5)
                .trigger("mouseleave", { force: true });

            cy.wrap(ev).its("trapMouse").should("eq", null);
        });
    });
});
