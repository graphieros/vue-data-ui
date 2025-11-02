import { defineComponent, h, reactive, ref } from 'vue';
import Legend from './Legend.vue';

describe('<Legend />', () => {

    const legend = [
        {
            name: 'circle',
            color: '#F00000',
            value: 1,
            shape: 'circle',
        },
        {
            name: 'triangle',
            color: '#00FF00',
            value: 2,
            shape: 'triangle',
        },
        {
            name: 'square',
            color: '#0000FF',
            value: 3,
            shape: 'square',
        },
        {
            name: 'diamond',
            color: '#F0FF00',
            value: 4,
            shape: 'diamond',
        },
        {
            name: 'pentagon',
            color: '#F000F0',
            value: 6,
            shape: 'pentagon',
        },
        {
            name: 'hexagon',
            color: '#FF99AA',
            value: 7,
            shape: 'hexagon',
        },
        {
            name: 'star',
            color: '#66AA66',
            value: 8,
            shape: 'star',
        },
    ];

    it('renders correctly with slots', () => {
        cy.mount(defineComponent({
            components: { Legend },
            setup() {
                const legendSet = legend
                const leg = ref(null);

                const config = reactive({
                    backgroundColor: '#fff',
                    fontSize: 14,
                    color: '#333',
                    paddingBottom: 12,
                    cy: 'legend-container'
                });

                return { legendSet, config, leg };
            },
            template: `
                <Legend ref="leg" :legendSet="legendSet" :config="config">
                    <template #legendTitle>
                        <div data-cy="legend-title" style="width:100%;text-align:center;font-weight:bold;padding:1rem">Legend Title</div>
                    </template>
                    <template #item="{ legend }">
                        <div data-cy="legend-item">{{ legend.name }} - value:{{ legend.value }}</div>
                    </template>
                </Legend>
            `
        })).then(({ wrapper }) => {
            cy.get('[data-cy="legend-title"]').should('exist').and('contain', 'Legend Title');
            cy.get('[data-cy="legend-item"]').as('items').should('have.length', 7);
            cy.get('@items').each((item, i) => {
                cy.wrap(item).as('item')
                cy.get('@item').should('contain', `${legend[i].name} - value:${legend[i].value}`)
            })
        })
    });

    it('emits clickMarker with correct payload', () => {
        const config = {
            backgroundColor: '#fff',
            fontSize: 14,
            color: '#333',
            paddingBottom: 12,
            cy: 'legend-container',
        };

        const handlers = { onMarker: () => {} };
        cy.spy(handlers, 'onMarker').as('onMarker');

        cy.mount(Legend, {
            props: {
                legendSet: legend,
                config,
                onClickMarker: handlers.onMarker,
            },
            slots: {
                legendTitle: () =>
                    h('div', {
                        'data-cy': 'legend-title',
                        style: 'width:100%;text-align:center;font-weight:bold;padding:1rem',
                    }, 'Legend Title'),
                item: ({ legend: item }) =>
                    h('div', { 'data-cy': 'legend-item' }, `${item.name} - value:${item.value}`),
            },
        });

        cy.get('[data-cy="legend-marker"]').should('have.length', legend.length);
        cy.get('[data-cy="legend-marker"]').first().click();

        cy.get('@onMarker').should('have.been.calledOnce');
        cy.get('@onMarker').its('firstCall.args.0').then((payload) => {
            expect(payload).to.have.property('i', 0);
            expect(payload.legend).to.include(legend[0]);
        });
    });

});