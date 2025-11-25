// cypress/component/useObjectBindings.spec.js

import { defineComponent, ref, toRef } from 'vue'
import { useObjectBindings } from '../src/useObjectBindings'

describe('useObjectBindings', () => {
    it('creates refs for each leaf property', () => {
        const configRef = ref({ foo: { bar: 1 }, baz: 'test' })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                return { bindings }
            },
            template: `
                <div>
                <span data-cy="foo.bar">{{ bindings['foo.bar'] }}</span>
                <span data-cy="baz">{{ bindings.baz }}</span>
                </div>
            `
        })

        cy.mount(TestComponent)
        cy.get('[data-cy="foo.bar"]').should('have.text', '1')
        cy.get('[data-cy="baz"]').should('have.text', 'test')
    })

    it('updates configRef when computed ref is updated', () => {
        const configRef = ref({ x: { y: 10 } })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                return { bindings }
            },
            template: `<div></div>`,
        })

        cy.mount(TestComponent)
            .then(({ wrapper }) => {
                wrapper.vm.bindings['x.y'].value = 30
                expect(configRef.value.x.y).to.equal(30)
            })
    })

    it('ignores arrays by default (skipArrays=true)', () => {
        const configRef = ref({ arr: [1, 2, 3], obj: { val: 5 } })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                return { bindings }
            },
            template: `<div></div>`,
        })

        cy.mount(TestComponent).then(({ wrapper }) => {
            // Filter out Vue's private props
            const keys = Object
                .keys(wrapper.vm.bindings)
                .filter(k => !k.startsWith('__v_'))
            expect(keys).to.deep.equal(['obj.val'])
        })

    })

    it('includes array paths when skipArrays=false and allows writing to array entries', () => {
        const configRef = ref({
            arr: [
                { foo: 'bar' },
                { baz: 42 }
            ],
            obj: { val: 5 }
        })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef, { skipArrays: false })
                return { bindings }
            },
            template: `<div></div>`,
        })

        cy.mount(TestComponent).then(({ wrapper }) => {
            const bindings = wrapper.vm.bindings

            expect(bindings['arr.0.foo'].value).to.equal('bar')
            expect(bindings['arr.1.baz'].value).to.equal(42)
            expect(bindings['obj.val'].value).to.equal(5)

            bindings['arr.0.foo'].value = 'newBar'
            bindings['arr.1.baz'].value = 99
            bindings['obj.val'].value = 123

            expect(configRef.value.arr[0].foo).to.equal('newBar')
            expect(configRef.value.arr[1].baz).to.equal(99)
            expect(configRef.value.obj.val).to.equal(123)
        })
    })

    it('supports a custom delimitor', () => {
        const configRef = ref({ a: { b: 2 } })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef, { delimiter: '::' })
                return { bindings }
            },
            template: `<div><span data-cy="key">{{ bindings['a::b'] }}</span></div>`
        })

        cy.mount(TestComponent)
        cy.get('[data-cy="key"]').should('have.text', '2')
    })

    it('toggles configRef.chart.zoom.show via v-model on a toRef', () => {
        const configRef = ref({ chart: { zoom: { show: false } } })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                const zoomShow = bindings['chart.zoom.show']
                return { zoomShow }
            },
            template: `
                <div>
                <input
                    type="checkbox"
                    data-cy="zoom-input"
                    v-model="zoomShow"
                />
                </div>
            `,
        })

        cy.mount(TestComponent)

        cy.get('[data-cy="zoom-input"]').should('not.be.checked')
        cy.wrap(configRef).its('value.chart.zoom.show').should('be.false')

        cy.get('[data-cy="zoom-input"]')
            .check()
            .should('be.checked')
        cy.wrap(configRef).its('value.chart.zoom.show').should('be.true')

        cy.get('[data-cy="zoom-input"]')
            .uncheck()
            .should('not.be.checked')
        cy.wrap(configRef).its('value.chart.zoom.show').should('be.false')
    })

    it('warns when accessing a non-existent binding', () => {
        const configRef = ref({ foo: 'bar' })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                return { bindings }
            },
            template: `<div></div>`,
        })

        cy.window().then((win) => {
            cy.spy(win.console, 'warn').as('warn')
        })

        cy.mount(TestComponent)
            .then(({ wrapper }) => {
                // force trigger the get trap
                void wrapper.vm.bindings['baz']
            })
            .then(() => {
                cy.get('@warn').should(
                    'have.been.calledWith',
                    'Vue Data UI - useObjectBindings: no binding found for key "baz". Please verify you are binding to a property path which exists on the object.'
                )
            })
    })

    it('warns when setting a non-existent binding', () => {
        const configRef = ref({ foo: 'bar' })

        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef)
                return { bindings }
            },
            template: `<div></div>`,
        })

        cy.window().then((win) => {
            cy.spy(win.console, 'warn').as('warn')
        })

        cy.mount(TestComponent)
            .then(({ wrapper }) => {
                // force trigger the set trap
                wrapper.vm.bindings['baz'] = 'qux'
            })
            .then(() => {
                cy.get('@warn').should(
                    'have.been.calledWith',
                    'Vue Data UI - useObjectBindings: cannot set unknown binding "baz".'
                )
            })
    })
})
