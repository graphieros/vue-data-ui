import VueUiXy from "./vue-ui-xy.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { config, dataset } = components.find((c) => c.name === "VueUiXy");

function generateDayTimestamps(length) {
    const result = [];
    const start = new Date(2026, 0, 1);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < length; i += 1) {
        result.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).getTime());
    }

    return result;
}

function createDs(n, m = 100) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * m * - 1)
    }
    return arr
}

describe("<VueUiXy />", () => {
	it("renders default", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset,
				config,
			},
		}).then(() => {
			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true,
				slicer: true,
			});

			cy.log("grid");
			cy.get('[data-cy="xy-grid-line-x"]')
				.should("exist")
				.and("have.css", "opacity", "1");
			cy.get('[data-cy="xy-grid-line-y"]')
				.should("exist")
				.and("have.css", "opacity", "1");
			cy.get('[data-cy="xy-grid-horizontal-line"]')
				.should("exist")
				.and("have.css", "opacity", "1")
				.and("have.length", 7);
			cy.get('[data-cy="xy-grid-vertical-line"]')
				.should("exist")
				.and("have.css", "opacity", "1")
				.and("have.length", 1);

			cy.log("frame");
			cy.get('[data-cy="frame"]').should("exist").and("be.visible");

			cy.log("y labels");
			cy.get('[data-cy="axis-y-tick"]')
				.should("exist")
				.and("have.css", "opacity", "1")
				.and("have.length", 7);
			cy.get('[data-cy="axis-y-label"]')
				.as("yLabels")
				.should("exist")
				.and("be.visible");
			cy.get("@yLabels").first().contains(-19);
			cy.get("@yLabels").last().contains(19);

			cy.log("highlight areas");
			cy.get('[data-cy="highlight-area"]').should("exist").and("be.visible");
			cy.get('[data-cy="highlight-area-caption"]')
				.should("exist")
				.and("be.visible")
				.and("contain", config.chart.highlightArea.caption.text);

			cy.log("bars");
			cy.get('[data-cy="datapoint-bar"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[1].series.length);
			cy.get('[data-cy="datapoint-bar-label"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[1].series.length);

			cy.log("plots");
			cy.get('[data-cy="datapoint-plot"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[2].series.length);
			cy.get('[data-cy="datapoint-plot-label"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[2].series.length);

			cy.log("lines");
			cy.get('[data-cy="datapoint-line-coating-straight"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", 1);
			cy.get('[data-cy="datapoint-line-area-straight"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", 1);
			cy.get('[data-cy="datapoint-line-straight"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", 1);
			cy.get('[data-cy="datapoint-line-plot"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[0].series.length);
			cy.get('[data-cy="datapoint-line-label"]')
				.should("exist")
				.and("be.visible")
				.and("have.length", dataset[0].series.length);
		});
	});

	it("emits", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset,
				config,
			},
		}).then(({ wrapper }) => {
			cy.log("@selectTimeLabel");
			cy.get('[data-cy="time-label"]')
				.first()
				.click({ force: true })
				.then(() => {
					expect(wrapper.emitted("selectTimeLabel")).to.deep.equal([
						[
							{
								absoluteIndex: 0,
								label: "0",
								datapoint: [
									{
										name: dataset[0].name,
										shape: null,
										color: "#1f77b4ff",
										comments: [],
										prefix: "",
										suffix: "",
										type: dataset[0].type,
										value: dataset[0].series[0],
									},
									{
										name: dataset[1].name,
										shape: null,
										color: "#aec7e8ff",
										comments: [],
										prefix: "",
										suffix: "",
										type: dataset[1].type,
										value: dataset[1].series[0],
									},
									{
										name: dataset[2].name,
										shape: null,
										color: "#ff7f0eff",
										comments: [],
										prefix: "",
										suffix: "",
										type: dataset[2].type,
										value: dataset[2].series[0],
									},
								],
							},
						],
					]);
				});

			cy.log("@selectX");
			cy.get('.vue-ui-xy').trigger('mouseenter').trigger('click', { x: 40, y: 200})
				.then(() => {
					expect(wrapper.emitted("selectX")).to.deep.equal([
						[
							{
								index: 0,
								indexLabel: undefined,
								dataset: [
									{
										color: "#1f77b4ff",
										name: dataset[0].name,
										type: dataset[0].type,
										value: dataset[0].series[0],
									},
									{
										color: "#aec7e8ff",
										name: dataset[1].name,
										type: dataset[1].type,
										value: dataset[1].series[0],
									},
									{
										color: "#ff7f0eff",
										name: dataset[2].name,
										type: dataset[2].type,
										value: dataset[2].series[0],
									},
								],
							},
						],
					]);
				});

			cy.log("@selectLegend");
			cy.get('[data-cy="xy-div-legend-item-0"]')
				.click()
				.then(() => {
					expect(wrapper.emitted("selectLegend")).to.deep.equal([
						[
							[
								{
									color: "#aec7e8ff",
									name: dataset[1].name,
									type: dataset[1].type,
									values: dataset[1].series,
								},
								{
									color: "#ff7f0eff",
									name: dataset[2].name,
									type: dataset[2].type,
									values: dataset[1].series,
								},
							],
						],
					]);
				});
		});
	});

	const config2 = {
		chart: {
			grid: {
				labels: {
					xAxisLabels: {
						datetimeFormatter: {
							enable: true
						},
						values: generateDayTimestamps(365)
					}
				}
			},
			timeTag: {
				show: true,
				useDefaultFormat: false
			}
		}
	}

	const dataset2 = [
		{
			name: 'Series A',
			type: 'line',
			series: createDs(365)
		}
	]

	it("uses zoom slicer (preview) with formatted labels", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset: dataset2,
				config: {
					...config2,
					chart: {
						...config2.chart,
						zoom: {
							useDefaultFormat: false,
						}
					}
				},
			},
		}).then(() => {
			cy.get('[data-cy="slicer-handle-left"]').trigger('mousedown', { force: true });
			cy.get('[data-cy="slicer-label-left"]').contains('2026-01-01 00:00:00');
			cy.get('[data-cy="slicer-label-right"]').contains('2026-12-31 00:00:00');
		})
	})

	it("uses zoom slicer (preview) with customFormat labels", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset: dataset2,
				config: {
					...config2,
					chart: {
						...config2.chart,
						zoom: {
							customFormat: ({ absoluteIndex }) => {
								return String(absoluteIndex) + ' - CUSTOM'
							}
						}
					}
				},
			},
		}).then(() => {
			cy.get('[data-cy="slicer-handle-left"]').trigger('mousedown', { force: true });
			cy.get('[data-cy="slicer-label-left"]').contains('0 - CUSTOM');
			cy.get('[data-cy="slicer-label-right"]').contains('364 - CUSTOM');
		})
	})

	it("displays time tag with time format", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset: dataset2,
				config: {
					...config2,
				},
			},
		}).then(() => {
			cy.get('[data-cy="xy-svg"]').trigger('mouseenter');
			cy.get('[data-cy="xy-svg"]').trigger('mousemove');
			cy.get('[data-cy="time-tag"]').should('be.visible').and('contain', "2026-06-25 01:00:00")
		})
	})

	it("displays time tag with customFormat", () => {
		cy.mount(VueUiXy, {
			props: {
				dataset: dataset2,
				config: {
					...config2,
					chart: {
						...config2.chart,
						timeTag: {
							show: true,
							customFormat: ({ absoluteIndex }) => {
								return String(absoluteIndex) + ' - CUSTOM';
							}
						}
					}
				},
			},
		}).then(() => {
			cy.get('[data-cy="xy-svg"]').trigger('mouseenter');
			cy.get('[data-cy="xy-svg"]').trigger('mousemove');
			cy.get('[data-cy="time-tag"]').should('be.visible').and('contain', "175 - CUSTOM")
		})
	})
});
