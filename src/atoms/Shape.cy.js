import { createApp } from 'vue';
import Shape from './Shape.vue';

describe('<Shape />', () => {
    function cleanup() {
        cy.document().then((doc) => {
            const svgs = doc.querySelectorAll('svg')
            svgs.forEach((svg) => svg.remove());
          });
    }
    it('renders a circle', () => {
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'circle',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 10,
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('circle').should('exist');
        cy.get('circle').should('have.attr', 'fill', '#000000')
    });

    it('renders a triangle', () => {
        cleanup()
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'triangle',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 8,
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('path').should('exist');
        cy.get('path').should('have.attr', 'd', 'M17.81037261709885,14.47192124059363 2.2220162933732697,14.52802047913314 9.967611089527882,1.0000582802732314 Z');
        cy.get('path').should('have.attr', 'fill', '#000000')
    });

    it('renders a square', () => {
        cleanup();
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'square',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 10
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('path').should('exist');
        cy.get('path').should('have.attr', 'd', 'M17.796805541920016,17.75949891046357 2.24050108953643,17.796805541920016 2.2031944580799845,2.24050108953643 17.759498910463574,2.203194458079988 Z');
        cy.get('path').should('have.attr', 'fill', '#000000')
    });

    it('renders a diamond', () => {
        cleanup();
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'diamond',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 9
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('path').should('exist');
        cy.get('path').should('have.attr', 'd', 'M20,10 10,20 0,10.000000000000002 9.999999999999998,0 Z');
        cy.get('path').should('have.attr', 'fill', '#000000')
    });

    it('renders a pentagon', () => {
        cleanup();
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'pentagon',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 9
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('path').should('exist');
        cy.get('path').should('have.attr', 'd', 'M15.816830894638835,18.134155047893735 4.061458436994172,18.04572707121316 0.5129485758196388,6.838377746321141 10.075221329844268,0.00028291642526312444 19.533540762703083,6.981457218146697 Z');
        cy.get('path').should('have.attr', 'fill', '#000000')
    });

    it('renders a haxagon', () => {
        cleanup();
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'hexagon',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 9
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('path').should('exist');
        cy.get('path').should('have.attr', 'd', 'M20,10 15,18.660254037844386 5.000000000000002,18.66025403784439 0,10.000000000000002 4.999999999999996,1.3397459621556163 14.999999999999993,1.3397459621556091 Z');
        cy.get('path').should('have.attr', 'fill', '#000000')
    });

    it('renders a star', () => {
        cleanup();
        cy.viewport(200, 200)
        cy.document().then((doc) => {
            const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 20 20');
            doc.body.appendChild(svg);

            const app = createApp(Shape, {
                shape: 'star',
                color: '#000000',
                plot: { x: 10, y: 10 },
                radius: 6
            });

            app.mount(svg);
        });

        cy.get('svg').should('exist');
        cy.get('polygon').should('exist');
        cy.get('polygon').should('have.attr', 'points', '1.9997309645126862,7.43959078274138 7.516308584228725,6.613072638625965 9.962874778918735,1.6000820409982772 12.453656480996605,6.591250981186301 17.977324387019237,7.368974415884909 14.000134517743653,11.280204608629324 14.967382831542576,16.77385472274805 10.018562610540648,14.199958979500861 5.092687038006768,16.81749803762738 6.011337806490377,11.315512792057532 ');
        cy.get('polygon').should('have.attr', 'fill', '#000000')
        
    });
})