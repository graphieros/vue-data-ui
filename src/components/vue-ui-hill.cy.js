import VueUiHill from './vue-ui-hill.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';
import { h } from 'vue';

const hillFixture = components.find(
    (component) => component.name === 'VueUiHill',
);

if (!hillFixture) {
    throw new Error('VueUiHill fixture was not found.');
}

const { config: baseConfig, dataset: baseDataset } = hillFixture;

const ACTION_LABELS = {
    update: 'Edit hill',
    cancel: 'Cancel edit',
    save: 'Save edit',
};

const BASIC_DATASET = [
    {
        id: 'todo',
        name: 'Todo',
        position: 0,
        color: '#3B9ED0',
    },
    {
        id: 'discovery',
        name: 'Discovery',
        position: 0.25,
        color: '#31A266',
    },
    {
        id: 'delivery',
        name: 'Delivery',
        position: 0.65,
        color: '#F39A2B',
    },
    {
        id: 'done',
        name: 'Done',
        position: 1,
        color: '#316EB5',
    },
];

const OVERFLOW_DATASET = Array.from({ length: 4 }, (_, index) => ({
    id: `overflow-${index}`,
    name: `Overflow item ${index + 1}`,
    position: 0.5,
    color: ['#3B9ED0', '#31A266', '#F39A2B', '#316EB5'][index],
}));

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(base, patch) {
    const output = isPlainObject(base) ? { ...base } : {};

    Object.entries(patch || {}).forEach(([key, value]) => {
        if (isPlainObject(value) && isPlainObject(output[key])) {
            output[key] = mergeDeep(output[key], value);
            return;
        }

        output[key] = Array.isArray(value) ? [...value] : value;
    });

    return output;
}

function makeConfig(patch = {}) {
    return mergeDeep(baseConfig, patch);
}

function editableConfig(events = {}, patch = {}) {
    return mergeDeep(
        {
            readonly: false,
            editing: false,
            transitions: {
                enable: false,
            },
            userOptions: {
                show: false,
            },
            events,
            style: {
                chart: {
                    toolbar: {
                        show: true,
                        buttons: {
                            translations: ACTION_LABELS,
                        },
                    },
                },
            },
        },
        patch,
    );
}

function mountHill({ dataset = BASIC_DATASET, config = {}, slots = {} } = {}) {
    return cy.mount(VueUiHill, {
        props: {
            dataset,
            config: makeConfig(config),
        },
        slots,
    });
}

function actionButtons() {
    return cy.get('.vue-ui-hill-actions__button');
}

function enterEditMode() {
    actionButtons()
        .should('have.length', 1)
        .first()
        .should('be.visible')
        .click({ force: true });

    cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'true');
    actionButtons().should('have.length', 2);
}

function cancelEdit() {
    actionButtons().should('have.length', 2).first().click({ force: true });
}

function saveEdit() {
    actionButtons().should('have.length', 2).last().click({ force: true });
}

function dispatchKeyboardEvent(element, key) {
    const win = element.ownerDocument.defaultView;
    const event = new win.KeyboardEvent('keydown', {
        key,
        code: key,
        bubbles: true,
        cancelable: true,
    });

    element.dispatchEvent(event);
}

function dispatchPointerEvent(element, type, options = {}) {
    const win = element.ownerDocument.defaultView;
    const EventConstructor = win.PointerEvent || win.MouseEvent;

    const event = new EventConstructor(type, {
        bubbles: !['pointerenter', 'pointerleave'].includes(type),
        cancelable: true,
        composed: true,
        pointerId: options.pointerId ?? 1,
        pointerType: options.pointerType ?? 'mouse',
        isPrimary: options.isPrimary ?? true,
        button: options.button ?? 0,
        buttons: options.buttons ?? 0,
        clientX: options.clientX ?? 0,
        clientY: options.clientY ?? 0,
    });

    if (event.pointerId === undefined) {
        Object.defineProperty(event, 'pointerId', {
            configurable: true,
            value: options.pointerId ?? 1,
        });
    }

    if (event.pointerType === undefined) {
        Object.defineProperty(event, 'pointerType', {
            configurable: true,
            value: options.pointerType ?? 'mouse',
        });
    }

    element.dispatchEvent(event);
}

function pressDatapointKey(datapointId, key) {
    cy.get(`[data-datapoint-id="${datapointId}"]`)
        .should('have.attr', 'tabindex', '0')
        .focus()
        .then(($datapoint) => {
            dispatchKeyboardEvent($datapoint[0], key);
        });
}

function dragDatapoint(datapointId, deltaX = 100) {
    cy.get(`[data-datapoint-id="${datapointId}"]`).then(($datapoint) => {
        const datapointElement = $datapoint[0];
        const svg = datapointElement.ownerSVGElement;
        const matrix = datapointElement.getScreenCTM();
        const hitArea = datapointElement.querySelector('circle');

        expect(svg, 'owner SVG element').to.exist;
        expect(matrix, 'datapoint screen matrix').to.exist;
        expect(hitArea, 'datapoint hit area').to.exist;

        Object.defineProperties(svg, {
            setPointerCapture: {
                configurable: true,
                value: () => {},
            },
            hasPointerCapture: {
                configurable: true,
                value: () => false,
            },
            releasePointerCapture: {
                configurable: true,
                value: () => {},
            },
        });

        const origin = svg.createSVGPoint();
        origin.x = 0;
        origin.y = 0;

        const start = origin.matrixTransform(matrix);
        const pointerId = 7;

        dispatchPointerEvent(hitArea, 'pointerdown', {
            pointerId,
            buttons: 1,
            clientX: start.x,
            clientY: start.y,
        });

        dispatchPointerEvent(svg, 'pointermove', {
            pointerId,
            buttons: 1,
            clientX: start.x + deltaX,
            clientY: start.y,
        });

        dispatchPointerEvent(svg, 'pointerup', {
            pointerId,
            buttons: 0,
            clientX: start.x + deltaX,
            clientY: start.y,
        });
    });
}

describe('<VueUiHill />', () => {
    beforeEach(() => {
        cy.viewport(1000, 700);
    });

    function commonTest() {
        testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: false,
            dataTable: false,
        });
    }

    it('renders', () => {
        cy.mount(VueUiHill, {
            props: {
                dataset: baseDataset,
                config: baseConfig,
            },
        });

        commonTest();

        cy.get('.vue-ui-hill').should('be.visible');
        cy.get('.vue-ui-hill svg[role="group"]').should('be.visible');
        cy.get('[data-cy-datapoint]').its('length').should('be.greaterThan', 0);
    });

    it('renders one accessible slider for each visible datapoint', () => {
        mountHill({
            config: {
                transitions: {
                    enable: false,
                },
                userOptions: {
                    show: false,
                },
                style: {
                    chart: {
                        toolbar: {
                            show: false,
                        },
                    },
                },
            },
        });

        cy.get('[data-cy-datapoint]').should(
            'have.length',
            BASIC_DATASET.length,
        );

        BASIC_DATASET.forEach((datapoint, index) => {
            cy.get(`[data-datapoint-id="${datapoint.id}"]`)
                .should('have.attr', 'role', 'slider')
                .and('have.attr', 'data-datapoint-index', String(index))
                .and('have.attr', 'aria-label', datapoint.name)
                .and('have.attr', 'tabindex', '-1');
        });
    });

    it('enters edit mode and calls the edit callback', () => {
        const onEdit = cy.spy().as('onEdit');

        mountHill({
            config: editableConfig({
                edit: onEdit,
            }),
        });

        cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'false');

        enterEditMode();

        cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'true');
        actionButtons().first().should('be.visible');
        actionButtons().last().should('be.visible');

        cy.get('[data-cy-datapoint]').each(($datapoint) => {
            cy.wrap($datapoint).should('have.attr', 'tabindex', '0');
        });

        cy.get('@onEdit').should((spy) => {
            expect(spy).to.have.been.calledOnce;
            expect(spy.firstCall.args[0]).to.have.length(BASIC_DATASET.length);
        });
    });

    it('moves a datapoint with the keyboard and saves the edited dataset', () => {
        const onChange = cy.spy().as('onChange');
        const onSave = cy.spy().as('onSave');

        const keyboardDataset = BASIC_DATASET.map((datapoint) =>
            datapoint.id === 'discovery'
                ? {
                      ...datapoint,
                      position: 0.4,
                  }
                : datapoint,
        );

        mountHill({
            dataset: keyboardDataset,
            config: editableConfig(
                {
                    change: onChange,
                    save: onSave,
                },
                {
                    interaction: {
                        keyboardStep: 0.1,
                    },
                },
            ),
        });

        enterEditMode();

        pressDatapointKey('discovery', 'ArrowRight');

        cy.get('@onChange').should((spy) => {
            expect(spy).to.have.been.calledOnce;

            const payload = spy.firstCall.args[0];

            expect(payload.datapoint.id).to.equal('discovery');
            expect(payload.datapoint.position).to.be.closeTo(0.5, 0.000001);
            expect(
                payload.dataset.find(
                    (datapoint) => datapoint.id === 'discovery',
                ).position,
            ).to.be.closeTo(0.5, 0.000001);
        });

        saveEdit();

        cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'false');

        cy.get('@onSave').should((spy) => {
            expect(spy).to.have.been.calledOnce;

            const savedDataset = spy.firstCall.args[0];
            const savedDatapoint = savedDataset.find(
                (datapoint) => datapoint.id === 'discovery',
            );

            expect(savedDatapoint.position).to.be.closeTo(0.5, 0.000001);
        });
    });

    it('restores the original dataset when an edit is cancelled', () => {
        const onChange = cy.spy().as('onChange');
        const onCancel = cy.spy().as('onCancel');

        const originalPosition = 0.3;
        const cancelDataset = BASIC_DATASET.map((datapoint) =>
            datapoint.id === 'discovery'
                ? {
                      ...datapoint,
                      position: originalPosition,
                  }
                : datapoint,
        );

        mountHill({
            dataset: cancelDataset,
            config: editableConfig({
                change: onChange,
                cancel: onCancel,
            }),
        });

        enterEditMode();

        pressDatapointKey('discovery', 'End');

        cy.get('@onChange').should('have.been.calledOnce');

        cancelEdit();

        cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'false');

        cy.get('@onCancel').should((spy) => {
            expect(spy).to.have.been.calledOnce;

            const cancelledDataset = spy.firstCall.args[0];
            const restoredDatapoint = cancelledDataset.find(
                (datapoint) => datapoint.id === 'discovery',
            );

            expect(restoredDatapoint.position).to.equal(originalPosition);
        });
    });

    it('calls selectDatapoint with the public datapoint and original index', () => {
        const onSelectDatapoint = cy.spy().as('onSelectDatapoint');

        mountHill({
            config: editableConfig(
                {
                    selectDatapoint: onSelectDatapoint,
                },
                {
                    style: {
                        chart: {
                            toolbar: {
                                show: false,
                            },
                        },
                    },
                },
            ),
        });

        cy.get('[data-datapoint-id="delivery"]').click({
            force: true,
        });

        cy.get('@onSelectDatapoint').should((spy) => {
            expect(spy).to.have.been.calledOnce;

            const payload = spy.firstCall.args[0];

            expect(payload.index).to.equal(2);
            expect(payload.datapoint.id).to.equal('delivery');
            expect(payload.datapoint.__index).to.equal(undefined);
        });
    });

    it('calls datapointEnter and datapointLeave with the original index', () => {
        const onDatapointEnter = cy.spy().as('onDatapointEnter');
        const onDatapointLeave = cy.spy().as('onDatapointLeave');

        mountHill({
            config: editableConfig(
                {
                    datapointEnter: onDatapointEnter,
                    datapointLeave: onDatapointLeave,
                },
                {
                    style: {
                        chart: {
                            toolbar: {
                                show: false,
                            },
                        },
                    },
                },
            ),
        });

        cy.get('[data-datapoint-id="discovery"]').then(($datapoint) => {
            dispatchPointerEvent($datapoint[0], 'pointerenter');
        });

        cy.get('@onDatapointEnter').should('have.been.calledOnce');

        cy.get('[data-datapoint-id="discovery"]').then(($datapoint) => {
            dispatchPointerEvent($datapoint[0], 'pointerleave');
        });

        cy.get('@onDatapointEnter').should((spy) => {
            expect(spy).to.have.been.calledOnce;
            expect(spy.firstCall.args[0].index).to.equal(1);
            expect(spy.firstCall.args[0].datapoint.id).to.equal('discovery');
        });

        cy.get('@onDatapointLeave').should((spy) => {
            expect(spy).to.have.been.calledOnce;
            expect(spy.firstCall.args[0].index).to.equal(1);
            expect(spy.firstCall.args[0].datapoint.id).to.equal('discovery');
        });
    });

    it('emits dragStart, change, and dragEnd during pointer dragging', () => {
        const onDragStart = cy.spy().as('onDragStart');
        const onChange = cy.spy().as('onDragChange');
        const onDragEnd = cy.spy().as('onDragEnd');

        mountHill({
            config: editableConfig({
                dragStart: onDragStart,
                change: onChange,
                dragEnd: onDragEnd,
            }),
        });

        enterEditMode();

        dragDatapoint('discovery', 120);

        cy.get('@onDragStart').should('have.been.calledOnce');

        cy.get('@onDragChange').should((spy) => {
            expect(spy.callCount).to.be.greaterThan(0);
        });

        cy.get('@onDragEnd').should((spy) => {
            expect(spy).to.have.been.calledOnce;
            expect(spy.firstCall.args[0].id).to.equal('discovery');
            expect(spy.firstCall.args[0].position).to.be.greaterThan(0.25);
        });
    });

    it('prevents edit mode when readonly is enabled', () => {
        mountHill({
            config: editableConfig(
                {},
                {
                    readonly: true,
                    editing: true,
                },
            ),
        });

        cy.get('.vue-ui-hill').should('have.attr', 'data-editing', 'false');
        cy.get('.vue-ui-hill-actions').should('not.exist');

        cy.get('[data-cy-datapoint]').each(($datapoint) => {
            cy.wrap($datapoint).should('have.attr', 'tabindex', '-1');
        });
    });

    it('opens an overflow menu, promotes an item, and restores the stack on outside pointerdown', () => {
        const onSelectDatapoint = cy.spy().as('onOverflowSelect');

        mountHill({
            dataset: OVERFLOW_DATASET,
            config: editableConfig(
                {
                    selectDatapoint: onSelectDatapoint,
                },
                {
                    editing: true,
                    style: {
                        chart: {
                            width: 600,
                            height: 120,
                            layout: {
                                plots: {
                                    radius: 12,
                                    hitRadius: 20,
                                    strokeWidth: 1,
                                    stacking: {
                                        show: true,
                                        overlapThresholdRatio: 0.5,
                                        gap: null,
                                        overflow: {
                                            show: true,
                                            transitionDuration: 0,
                                            marker: {
                                                radius: 12,
                                                fill: '#777777',
                                                stroke: '#FFFFFF',
                                                strokeWidth: 1,
                                                labelColor: '#FFFFFF',
                                                fontSize: 12,
                                                bold: true,
                                                labelOffsetY: 6,
                                            },
                                            menu: {
                                                title: 'Select an item',
                                                width: 220,
                                                maxHeight: 220,
                                                backgroundColor: '#FFFFFF',
                                                color: '#2D353C',
                                                borderColor: '#CCCCCC',
                                                borderRadius: 6,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ),
        });

        cy.get('[data-stack-overflow-marker]')
            .should('have.length', 1)
            .find('.vue-ui-hill__stack-overflow-marker-label')
            .should('contain.text', '+4');

        cy.get('[data-stack-overflow-marker]').click({
            force: true,
        });

        cy.get('[data-stack-overflow-menu]')
            .should('be.visible')
            .and('have.attr', 'role', 'listbox');

        cy.get('.vue-ui-hill__stack-overflow-menu-item').should(
            'have.length',
            OVERFLOW_DATASET.length,
        );

        cy.get('[data-stack-overflow-menu]').then(($menu) => {
            const menu = $menu[0];

            expect(menu.offsetWidth).to.be.at.least(220);
            expect(menu.scrollHeight).to.be.at.most(menu.clientHeight + 1);
        });

        cy.get('[data-stack-overflow-marker]').then(($marker) => {
            const marker = $marker[0];
            const svg = marker.ownerSVGElement;
            const matrix = marker.getScreenCTM();

            expect(matrix, 'overflow marker screen matrix').to.exist;

            const origin = svg.createSVGPoint();
            origin.x = 0;
            origin.y = 0;

            const markerScreenPoint = origin.matrixTransform(matrix);

            cy.get('[data-stack-overflow-menu]').then(($menu) => {
                const menuRect = $menu[0].getBoundingClientRect();
                const menuCenterX = menuRect.left + menuRect.width / 2;

                expect(menuCenterX).to.be.closeTo(markerScreenPoint.x, 3);
            });
        });

        cy.get('.vue-ui-hill__stack-overflow-menu-item').first().click();

        cy.get('[data-stack-overflow-menu]').should('not.exist');

        cy.get('[data-datapoint-id="overflow-0"]')
            .should('exist')
            .and('be.visible');

        cy.focused().should('have.attr', 'data-datapoint-id', 'overflow-0');

        cy.get(
            '[data-stack-overflow-marker] .vue-ui-hill__stack-overflow-marker-label',
        ).should('contain.text', '+3');

        cy.get('@onOverflowSelect').should((spy) => {
            expect(spy).to.have.been.calledOnce;
            expect(spy.firstCall.args[0].index).to.equal(0);
            expect(spy.firstCall.args[0].datapoint.id).to.equal('overflow-0');
        });

        cy.get('body').then(($body) => {
            dispatchPointerEvent($body[0], 'pointerdown', {
                pointerId: 99,
                buttons: 1,
                clientX: 2,
                clientY: 2,
            });
        });

        cy.get('[data-datapoint-id="overflow-0"]').should('not.exist');

        cy.get(
            '[data-stack-overflow-marker] .vue-ui-hill__stack-overflow-marker-label',
        ).should('contain.text', '+4');
    });

    it('renders a custom loading slot', () => {
        mountHill({
            config: {
                transitions: {
                    enable: false,
                },
                loading: true,
                userOptions: {
                    show: false,
                },
                style: {
                    chart: {
                        toolbar: {
                            show: false,
                        },
                    },
                },
            },
            slots: {
                loading: () =>
                    h(
                        'div',
                        {
                            'data-cy': 'hill-loading-slot',
                        },
                        'Loading hill',
                    ),
            },
        });

        cy.get('[data-cy="hill-loading-slot"]')
            .should('be.visible')
            .and('contain.text', 'Loading hill');
    });
});
