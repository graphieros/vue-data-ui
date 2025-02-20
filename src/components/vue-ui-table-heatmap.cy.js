import { testCommonFeatures } from "../../cypress/fixtures";
import { calcMedian } from "../lib";
import VueUiTableHeatmap from "./vue-ui-table-heatmap.vue";
import { h } from "vue";

describe('<VueUiTableHeatmap />', () => {

    const dataset = [
        {
            name: "S1",
            values: [1, 1, 1],
            color: '#1f77b4',
            shape: 'circle'
        },
        {
            name: "S2",
            values: [2, 2, 2],
            color: '#aec7e8',
            shape: 'triangle'
        },
        {
            name: "S3",
            values: [3, 3, 3],
            color: '#ff7f0e',
            shape: 'diamond'
        },
    ]

    const config = {
        table: {
            showSum: true,
            showAverage: true,
            showMedian: true,
            head: {
                values: ['A', 'B', 'C', 'D', 's', 'a', 'm']
            }
        }
    }
    
    it('renders with slots', () => {
        cy.mount(VueUiTableHeatmap, {
            props: {
                dataset,
                config
            },
            slots: {
                head: ({ value }) => h('div', { 'data-cy' : 'slot-head' }, value),
                rowTitle: ({ value }) => h('div', { 'data-cy' : 'slot-row-title' }, value),
                cell: ({ value, color, textColor }) => h('div', {
                    'data-cy': 'slot-cell',
                    style: `background: ${color}; color: ${textColor}`,
                }, value),
                sum: ({ value }) => h('div', { 'data-cy': 'slot-sum' }, value),
                average: ({ value }) => h('div', { 'data-cy': 'slot-average' }, value.toFixed(0)),
                median: ({ value }) => h('div', { 'data-cy': 'slot-median' }, value.toFixed(0)),
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true
            });

            cy.log('head slot');
            cy.get('[data-cy="slot-head"]').as('head').should('be.visible').and('have.length', config.table.head.values.length);
            cy.get('@head').each((th, i) => {
                cy.wrap(th).contains(config.table.head.values[i]);
            });

            cy.log('rowTitle slot');
            cy.get('[data-cy="slot-row-title"]').as('rowTitle').should('exist').and('be.visible');
            cy.get('@rowTitle').each((rt, i) =>  {
                cy.wrap(rt).contains(dataset[i].name);
            });

            cy.log('cell slot');
            cy.get('[data-cy="slot-cell"]').should('exist').and('be.visible').and('have.length', dataset.length * dataset[0].values.length);

            cy.log('sum slot');
            cy.get('[data-cy="slot-sum"]').as('sum').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@sum').each((s,i) => {
                cy.wrap(s).contains(dataset[i].values.reduce((a, b) => a + b, 0));
            });

            cy.log('average slot');
            cy.get('[data-cy="slot-average"]').as('avg').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@avg').each((avg, i) => {
                const average = dataset[i].values.reduce((a, b) => a + b, 0) / dataset[i].values.length;
                cy.wrap(avg).contains(average.toFixed(0));
            });

            cy.log('median slot');
            cy.get('[data-cy="slot-median"]').as('med').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@med').each((med, i) => {
                const median = calcMedian(dataset[i].values);
                cy.wrap(med).contains(median.toFixed(0));
            });
        });
    });
});