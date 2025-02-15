import { defineComponent, reactive, ref } from 'vue';
import DataTable from './DataTable.vue';

describe('<DataTable />', () => {
    it('renders correctly with slots', () => {
        cy.viewport(800, 500)
        cy.mount(defineComponent({
            components: { DataTable },
            setup() {
                const colNames = reactive(["Column 1", "Column 2", "Column 3"]);
                const head = reactive([
                    { name: "Header 1", color: "#FF0000" },
                    { name: "Header 2", color: "#00FF00" },
                    { name: "Header 3", color: "#0000FF" },
                ]);
                const body = reactive([
                    [{ name: "Row 1 - Col 1" }, { name: "Row 1 - Col 2" }, { name: "Row 1 - Col 3" }],
                    [{ name: "Row 2 - Col 1" }, { name: "Row 2 - Col 2" }, { name: "Row 2 - Col 3" }],
                ]);
                const config = reactive({
                    th: { backgroundColor: "#f0f0f0", color: "#000", outline: "1px solid #ccc" },
                    td: { backgroundColor: "#fff", color: "#333", outline: "1px solid #ddd" },
                    shape: "circle",
                    breakpoint: 600,
                });

                const closeEmitted = ref(false);

                return { colNames, head, body, config, closeEmitted };
            },
            template: `
                <DataTable 
                    :colNames="colNames" 
                    :head="head" 
                    :body="body" 
                    title="Test Table"
                    :config="config"
                    @close="closeEmitted = true"
                >
                    <template #th="{ th }">
                        <span data-cy="th">{{ th.name }}</span>
                    </template>
                    <template #td="{ td }">
                        <span data-cy="td">{{ td.name }}</span>
                    </template>
                </DataTable>
            `
        }));

        cy.get('[data-cy="vue-data-ui-table-data"]').should('exist');
        cy.get('caption').should('contain', 'Test Table');
        cy.get('[data-cy="th"]').should('have.length', 3);
        cy.get('[data-cy="th"]').first().should('contain', 'Header 1');
        cy.get('[data-cy="td"]').should('have.length', 6);
        cy.get('[data-cy="td"]').first().should('contain', 'Row 1 - Col 1');
        cy.get('[role="button"]').click();
        cy.get('[data-cy="th"]').should('exist'); 

        cy.log('Responsive mode')
        cy.viewport(500, 350);
        cy.get('th').should('not.be.visible');
        cy.get('td').first().should('have.attr', 'data-cell', 'Column 1');

        cy.log('close')
        cy.get('[data-cy="data-table-close"]').click()
        cy.wrap(null).then(() => {
            expect(Cypress.vueWrapper.vm.closeEmitted).to.be.true;
        });
    });
});
