/**
 * Fixtures for VueDataUi cy test
 */
export const components = [
    {
        name: "VueUi3dBar",
        dataset: { percentage: 100 },
        dataset2: {
            series: [
                {
                    name:  'Serie 1 with a long name that should be shorter but we do not have the choice',
                    value: 256,
                    breakdown: [
                        {
                            name: 'Sub serie 1',
                            value: 100
                        },
                        {
                            name: 'Sub serie 2',
                            value: 90
                        },
                        {
                            name: 'Sub serie 3',
                            value: 66
                        }
                    ]
                },
                {
                    name: 'Serie 2',
                    value: 128
                },
                {
                    name: 'Serie 3',
                    value: 64
                },
                {
                    name: 'Serie 4',
                    value: 32
                },
                {
                    name: 'Serie 5',
                    value: 16
                },
                {
                    name: 'Serie 6',
                    value: 8
                }
            ]
        },
        wrapperClass: ".vue-ui-3d-bar",
    },
    {
        name: "VueUiAgePyramid",
        dataset: [
            ["2017", 5, 366538, 382762],
            ["2018", 4, 356873, 376705],
            ["2019", 3, 351707, 368670],
            ["2020", 2, 341042, 356678],
            ["2021", 1, 343026, 357351],
            ["2022", 0, 330929, 345538],
        ],
        config: {
            style: {
                title: {
                    text: 'Title',
                    subtitle: { text: 'Subtitle' }
                }
            }
        },
        wrapperClass: ".vue-ui-age-pyramid",
    },
    {
        name: "VueUiAnnotator",
        dataset: { shapes: [], lastSelectedShape: undefined },
        wrapperClass: ".vue-ui-annotator",
    },
    {
        name: "VueUiCandlestick",
        dataset: [
            ["2024-01-01", 56, 120, 40, 110, 1250],
            ["2024-02-01", 110, 150, 80, 98, 2200],
        ],
        wrapperClass: ".vue-ui-candlestick",
    },
    {
        name: "VueUiChestnut",
        dataset: [
            {
                name: "Root1",
                branches: [
                    {
                        name: "branch 1.1",
                        value: 200,
                        breakdown: [
                            {
                                name: "break 1.1.1",
                                value: 50,
                            },
                            {
                                name: "break 1.1.2",
                                value: 25,
                            },
                            {
                                name: "break 1.1.3",
                                value: 25,
                            },
                        ],
                    },
                ],
            },
        ],
        wrapperClass: ".vue-ui-chestnut",
    },
    {
        name: "VueUiDashboard",
        dataset: [],
        wrapperClass: ".vue-ui-dashboard-container",
    },
    { name: "VueUiDigits", dataset: 99, wrapperClass: ".vue-ui-digits" },
    {
        name: "VueUiDonut",
        dataset: [{ name: "S", values: [1] }],
        wrapperClass: ".vue-ui-donut",
    },
    {
        name: "VueUiDonutEvolution",
        dataset: [
            {
                name: "Serie 1",
                values: [55.123425162, 34, 21, 13, 8, 5, 8, 13, 21, 34, 55],
            },
            {
                name: "Serie 2",
                values: [1, 12, 24, 32, 5, 8, 13, 21, 34, 55, 89],
            },
            {
                name: "Serie 3",
                values: [16, 2, 3, 5, 28, 13, 21, 34, 55, 89, 134],
            },
            {
                name: "Serie 4",
                values: [5, null, 5, 5, 5, 5],
            },
        ],
        wrapperClass: ".vue-ui-donut-evolution",
    },
    {
        name: "VueUiGalaxy",
        dataset: [{ name: "S", values: [1] }],
        wrapperClass: ".vue-ui-galaxy",
    },
    {
        name: "VueUiGauge",
        dataset: {
            base: 100,
            value: 0,
            series: [
                { from: -100, to: -70, name: "series 1", nameOffsetRatio: 1 },
                { from: -70, to: -35, name: "series 2", nameOffsetRatio: 1 },
                { from: -35, to: 0, name: "series 3", nameOffsetRatio: 1 },
                { from: 0, to: 50, name: "series 4", nameOffsetRatio: 1 },
                { from: 50, to: 100, name: "series 5" },
            ],
        },
        wrapperClass: ".vue-ui-gauge",
    },
    {
        name: "VueUiHeatmap",
        dataset: (function makeDs() {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const arr = [];
            const dsLen = 26;
            const serieLen = days.length;
            for (let i = 0; i < serieLen; i += 1) {
                const values = [];
                for (let j = 0; j < dsLen; j += 1) {
                    values.push(i + j * 2);
                }
                arr.push({
                    name: `${days[i]}`,
                    values,
                });
            }
            return arr;
        })(),
        wrapperClass: ".vue-ui-heatmap",
    },
    { name: "VueUiKpi", dataset: 100, wrapperClass: ".vue-ui-kpi" },
    {
        name: "VueUiMiniLoader",
        dataset: undefined,
        wrapperClass: ".vue-ui-mini-loader",
    },
    {
        name: "VueUiMolecule",
        dataset: [
            {
                name: "Root",
                details: "This is the root node",
                nodes: [
                    {
                        name: "node1",
                        details: "Lorem ipsum",
                        nodes: [
                            {
                                name: "node1.1",
                                details: "Lorem ipsum",
                                nodes: [
                                    { name: "node1.1" },
                                    { name: "node1.2" },
                                    { name: "node1.3" },
                                ],
                            },
                            {
                                name: "node1.2",
                                nodes: [
                                    { name: "node1.2.1" },
                                    { name: "node1.2.2" },
                                    { name: "node1.2.3" },
                                    { name: "node1.2.4" },
                                ],
                            },
                            {
                                name: "node1.3",
                                nodes: [{ name: "node1.3.1" }, { name: "node1.3.2" }],
                            },
                            {
                                name: "node1.4",
                                nodes: [
                                    { name: "node1.4.1" },
                                    { name: "node1.4.2" },
                                    { name: "node1.4.3" },
                                    { name: "node1.4.4" },
                                    { name: "node1.4.5" },
                                    { name: "node1.4.6" },
                                ],
                            },
                            {
                                name: "node1.5",
                                nodes: [
                                    { name: "node1.5.1" },
                                    { name: "node1.5.2" },
                                    { name: "node1.5.3" },
                                    { name: "node1.5.4" },
                                    { name: "node1.5.5" },
                                    { name: "node1.5.6" },
                                ],
                            },
                            {
                                name: "node1.6",
                                nodes: [
                                    { name: "node1.6.1" },
                                    { name: "node1.6.2" },
                                    { name: "node1.6.3" },
                                    { name: "node1.6.4" },
                                    { name: "node1.6.5" },
                                    { name: "node1.6.6" },
                                ],
                            },
                        ],
                    },
                    {
                        name: "node2",
                        nodes: [
                            {
                                name: "node2.1",
                                nodes: [
                                    { name: "node2.1.1" },
                                    { name: "node2.1.2" },
                                    { name: "node2.1.3" },
                                    { name: "node2.1.4" },
                                    { name: "node2.1.5" },
                                    {
                                        name: "node2.1.6",
                                        nodes: [
                                            { name: "node2.1.6.1" },
                                            { name: "node2.1.6.2" },
                                            { name: "node2.1.6.3" },
                                            { name: "node2.1.6.4" },
                                            { name: "node2.1.6.5" },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: "node3",
                        nodes: [
                            { name: "node3.1" },
                            { name: "node3.2" },
                            { name: "node3.3" },
                        ],
                    },
                    {
                        name: "node4",
                        nodes: [
                            { name: "node4.1" },
                            {
                                name: "node4.2",
                                nodes: [
                                    { name: "node4.2.1" },
                                    { name: "node4.2.2" },
                                    { name: "node4.2.3" },
                                ],
                            },
                            { name: "node4.3" },
                            {
                                name: "node4.4",
                                nodes: [
                                    { name: "node4.4.1" },
                                    { name: "node4.4.2" },
                                    { name: "node4.4.3" },
                                    { name: "node4.4.4" },
                                    { name: "node4.4.5" },
                                ],
                            },
                        ],
                    },
                    {
                        name: "node5",
                        nodes: [
                            { name: "node4.1" },
                            { name: "node4.2" },
                            { name: "node4.3" },
                            { name: "node4.4" },
                            { name: "node4.5" },
                        ],
                    },
                    {
                        name: "node6",
                        nodes: [
                            { name: "node4.1" },
                            { name: "node4.2" },
                            { name: "node4.3" },
                            { name: "node4.4" },
                        ],
                    },
                ],
            },
        ],
        wrapperClass: ".vue-ui-molecule",
    },
    {
        name: "VueUiMoodRadar",
        dataset: {
            1: 96,
            2: 64,
            3: 128,
            4: 256,
            5: 384,
        },
        wrapperClass: ".vue-ui-mood-radar",
    },
    {
        name: "VueUiNestedDonuts",
        dataset: [
            {
                name: "Group 1",
                series: [
                    {
                        name: "Serie 1",
                        values: [50],
                    },
                    {
                        name: "Serie 2",
                        values: [30],
                    },
                    {
                        name: "Serie 3",
                        values: [20],
                    },
                ],
            },
            {
                name: "Group 2",
                series: [
                    {
                        name: "Serie 1",
                        values: [40],
                    },
                    {
                        name: "Serie 2",
                        values: [40],
                    },
                    {
                        name: "Serie 3",
                        values: [30],
                    },
                ],
            },
        ],
        wrapperClass: ".vue-ui-nested-donuts",
    },
    {
        name: "VueUiOnion",
        dataset: [
            {
                name: "Serie 1",
                percentage: 50,
                value: 1200,
            },
            {
                name: "Serie 2",
                percentage: 50,
                value: 1000,
            },
            {
                name: "Serie 3",
                percentage: 50,
                value: 500,
            },
            {
                name: "Serie 4",
                percentage: 50,
                value: 1280,
            },
        ],
        wrapperClass: ".vue-ui-onion",
    },
    {
        name: "VueUiQuadrant",
        dataset: [
            {
                name: "S",
                shape: "star",
                series: (function makeDs(n, m) {
                    const arr = [];
                    for (let i = 0; i < n; i += 1) {
                        arr.push({
                            name: "Serie",
                            x: i % 2 === 0 ? i : -i,
                            y: i % 3 === 0 ? i : -i,
                        });
                    }
                    return arr;
                })(10, 10),
            },
        ],
        wrapperClass: ".vue-ui-quadrant",
    },
    {
        name: "VueUiRadar",
        dataset: {
            categories: [
                { name: "Category 1" },
                { name: "Category 2" },
                { name: "Category 3" },
            ],
            series: [
                {
                    name: "Serie 1",
                    values: [60, 20, 30],
                    target: 100,
                    formatter: ({ value }) => {
                        return `f1 - ${value}`;
                    },
                },
                {
                    name: "Serie 2",
                    values: [20, 80, 40],
                    target: 100,
                    formatter: ({ value }) => {
                        return `f2 - ${value}`;
                    },
                },
                {
                    name: "Serie 3",
                    values: [50, 60, 70],
                    target: 100,
                },
            ],
        },
        wrapperClass: ".vue-ui-radar",
    },
    {
        name: "VueUiRating",
        dataset: { rating: 3 },
        wrapperClass: ".vue-ui-rating",
    },
    {
        name: "VueUiRelationCircle",
        dataset: [
            {
                id: "01",
                label: "Lorem",
                relations: [
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12",
                ],
                weights: [5, 3, 20, 2, 9, 3, 1, 2, 3, 7, 1],
            },
            {
                id: "02",
                label: "Ipsum",
                relations: ["01", "03"],
                weights: [3, 2],
            },
            {
                id: "03",
                label: "Dolor",
                relations: ["01", "02"],
                weights: [2, 5],
            },
            {
                id: "04",
                label: "Consectetur",
                relations: ["01", "05", "10"],
                weights: [3, 1, 4],
            },
            {
                id: "05",
                label: "Amet",
                relations: ["01", "04", "07", "10"],
                weights: [2, 3, 4, 5],
            },
            {
                id: "06",
                label: "Rherum",
                relations: ["01", "02"],
                weights: [4, 1],
            },
            {
                id: "07",
                label: "Delecta",
                relations: ["01", "02", "08", "12"],
                weights: [4, 8, 2, 1],
            },
            {
                id: "08",
                label: "Nitimur",
                relations: ["01", "07", "12", "01"],
                weights: [7, 3, 2, 3],
            },
            {
                id: "09",
                label: "Vetitum",
                relations: ["01"],
                weights: [1],
            },
            {
                id: "10",
                label: "Monumentum",
                relations: ["01", "04", "05"],
                weights: [4, 1, 4],
            },
            {
                id: "11",
                label: "Aere",
                relations: ["01"],
                weights: [3],
            },
            {
                id: "12",
                label: "Perennius",
                relations: ["01", "07", "08"],
                weights: [8, 1, 1],
            },
        ],
        wrapperClass: ".vue-ui-relation-circle",
    },
    {
        name: "VueUiRings",
        dataset: [
            {
                name: "Serie 1",
                values: [100],
            },
            {
                name: "Serie 2",
                values: [200],
            },
            {
                name: "Serie 3",
                values: [300, 1],
            },
            {
                name: "Serie 4",
                values: [50, 1],
            },
            {
                name: "Serie 5",
                values: [25, 1],
            },
        ],
        wrapperClass: ".vue-ui-rings",
    },
    {
        name: "VueUiScatter",
        dataset: [
            {
                name: "S",
                values: (function IIFE() {
                    const arr = [];
                    for (let i = -10; i < 10; i += 1) {
                        arr.push({
                            x: Math.random() * (Math.random() > 0.3 ? i / 3 : -i / 5),
                            y: (Math.random() * i) / 20,
                            name: `plot_${i}_cluster_1`,
                        });
                    }
                    return arr;
                })(),
                shape: "star",
            },
        ],
        wrapperClass: ".vue-ui-scatter",
    },
    {
        name: "VueUiSkeleton",
        dataset: undefined,
        wrapperClass: ".vue-ui-skeleton",
    },
    {
        name: "VueUiSmiley",
        dataset: { rating: 5 },
        wrapperClass: ".vue-ui-smiley",
    },
    {
        name: "VueUiSparkbar",
        dataset: [
            {
                name: "quality",
                value: 200,
                rounding: 2,
                suffix: "%",
                prefix: "P",
                target: 1000,
            },
            {
                name: "popularity",
                value: 2.0412,
                rounding: 2,
                suffix: "%",
                prefix: "P",
                target: 2.3,
            },
        ],
        wrapperClass: ".vue-ui-sparkbar",
    },
    {
        name: "VueUiSparkgauge",
        dataset: {
            value: 0,
            min: -2,
            max: 2,
            title: "KPI 1",
        },
        wrapperClass: ".vue-ui-sparkgauge",
    },
    {
        name: "VueUiSparkHistogram",
        dataset: [
            {
                value: -1.2,
                valueLabel: "20.35%",
                timeLabel: "09:00",
                intensity: 1,
                color: "#FF0000",
            },
            {
                value: -1.3,
                valueLabel: "50%",
                timeLabel: "10:00",
                intensity: 0.5,
            },
            {
                value: 1.1,
                valueLabel: "60%",
                timeLabel: "11:00",
                intensity: 0.6,
                color: "#00FF00",
            },
            {
                value: 0.8,
                valueLabel: "70%",
                timeLabel: "12:00",
                intensity: 0.7,
            },
            {
                value: 2,
                valueLabel: "100%",
                timeLabel: "13:00",
                intensity: 1,
            },
            {
                value: 2.1,
                valueLabel: "100%",
                timeLabel: "14:00",
                intensity: 1,
            },
            {
                value: 2.3,
                valueLabel: "80%",
                timeLabel: "15:00",
                intensity: 0.8,
            },
            {
                value: 2.1,
                valueLabel: "70%",
                timeLabel: "16:00",
                intensity: 0.7,
            },
            {
                value: 0.9,
                valueLabel: "60%",
                timeLabel: "17:00",
                intensity: 0.6,
            },
            {
                value: 0.7,
                valueLabel: "50%",
                timeLabel: "18:00",
                intensity: 0.5,
            },
            {
                value: 0.3,
                valueLabel: "30%",
                timeLabel: "19:00",
                intensity: 0.3,
            },
            {
                value: 0.2,
                valueLabel: "20%",
                timeLabel: "20:00",
                intensity: 0.2,
            },
        ],
        wrapperClass: ".vue-ui-spark-histogram",
    },
    {
        name: 'VueUiSparkline',
        dataset: [
            {
                period: "period 1",
                value: 0
            },
            {
                period: "period 2",
                value: -1
            },
            {
                period: "period 3",
                value: 2
            },
            {
                period: "period 4",
                value: -3
            },
            {
                period: "period 5",
                value: 4
            },
            {
                period: "period 6",
                value: -5
            },
            {
                period: "period 7",
                value: 6
            },
            {
                period: "period 8",
                value: -7
            },
            {
                period: "period 9",
                value: 8
            },
            {
                period: "period 10",
                value: -9
            },
            {
                period: "period 11",
                value: 10
            },
            {
                period: "period 12",
                value: -11
            },
            {
                period: "period 13",
                value: 12
            },
            {
                period: "period 14",
                value: -13
            },
            {
                period: "period 15",
                value: 14
            },
            {
                period: "period 16",
                value: -15
            },
            {
                period: "period 17",
                value: 16
            },
        ],
        wrapperClass: '.vue-ui-sparkline'
    },
    {
        name: 'VueUiSparkStackbar',
        dataset: [
            {
                name: "Vue",
                value: 258,
            },
            {
                name: "Javascript",
                value: 36,
            },
            {
                name: "Other",
                value: 16,
            },
        ],
        wrapperClass: '.vue-ui-spark-stackbar'
    },
    {
        name: 'VueUiTable',
        dataset: {
            header: [
                {
                    name: "touchpoint",
                    type: "text",
                    average: false,
                    decimals: undefined,
                    sum: false,
                    isSort: true,
                    isSearch: true,
                    isMultiselect: true,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "category",
                    type: "text",
                    average: false,
                    decimals: undefined,
                    sum: false,
                    isSort: false,
                    isSearch: false,
                    isMultiselect: true,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "date",
                    type: "date",
                    average: false,
                    decimals: undefined,
                    sum: false,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "base",
                    type: "numeric",
                    average: true,
                    decimals: 0,
                    sum: true,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "rating",
                    type: "numeric",
                    decimals: 1,
                    average: true,
                    sum: false,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "",
                    prefix: "",
                    rangeFilter: true,
                },
                {
                    name: "spend",
                    type: "numeric",
                    decimals: 1,
                    average: true,
                    sum: true,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: undefined,
                    suffix: "€",
                    prefix: "",
                    rangeFilter: true,
                },
                {
                    name: "percentage",
                    type: "numeric",
                    decimals: 1,
                    average: false,
                    sum: false,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: true, // requires an empty slot in the body td arrays!
                    percentageTo: "base",
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "happy",
                    type: "numeric",
                    decimals: 0,
                    average: true,
                    sum: true,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: "base",
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
                {
                    name: "sad",
                    type: "numeric",
                    decimals: 0,
                    average: true,
                    sum: true,
                    isSort: true,
                    isSearch: false,
                    isMultiselect: false,
                    isPercentage: false,
                    percentageTo: "base",
                    suffix: "",
                    prefix: "",
                    rangeFilter: false,
                },
            ],
            body: (function IIFE() {
                const categories = ["Accueil", "Magasin", "Caisse", "SAV"];
                const itemNames = [
                    "Qualité du service",
                    "Rapidité de livraison",
                    "Efficacité du personnel",
                    "Variété des produits",
                    "Propreté des lieux",
                    "Réactivité du support",
                    "Prix compétitifs",
                    "Expérience utilisateur",
                    "Fiabilité du matériel",
                ];

                function generateRandomData() {
                    const items = [];

                    for (let i = 0; i < 1000; i += 1) {
                        const itemName = getRandomItemName();
                        const category = getRandomCategory();
                        let accueil = Math.random() * 100;
                        const date = getRandomDate();
                        const data = [
                            itemName,
                            category,
                            date,
                            accueil,
                            Number((Math.random() * 5).toFixed(1)),
                            Math.random() * 200,
                            "",
                            Math.random() * (Math.random() > 0.5 ? 150 : -30),
                            Math.random() * 350,
                        ];
                        items.push({ td: data });
                    }

                    return items;
                }

                function getRandomItemName() {
                    const randomIndex = Math.floor(Math.random() * itemNames.length);
                    return itemNames[randomIndex];
                }

                function getRandomCategory() {
                    const randomIndex = Math.floor(Math.random() * categories.length);
                    return categories[randomIndex];
                }

                function getRandomDate() {
                    const start = new Date(2023, 0, 1).getTime();
                    const end = new Date(2023, 11, 31).getTime();
                    const randomTime = Math.random() * (end - start) + start;
                    const randomDate = new Date(randomTime);
                    const formattedDate = randomDate.toISOString().split("T")[0];
                    return formattedDate;
                }
                return generateRandomData();
            })()
        },
        wrapperClass: '.vue-ui-table-main'
    },
    {
        name: 'VueUiTableSparkline',
        dataset: [
            {
                name: "Serie 1",
                values: [0, 1, 2, 3, 5, 8, 13],
            },
            {
                name: "Serie 2",
                values: [8.2, 12, 13, 25, 31, 42, 53, 42, 31, 25, 13, 12, 8],
            },
            {
                name: "Serie 3",
                values: [66, 22, 33, 12, 55, 64, 75, 64, 55, 12, 33, 22, 66],
            },
            {
                name: "Serie 4",
                values: [54, 44, 34, 12, 32, 26, 33, 26, 32, 12, 34, 44, 54],
            },
            {
                name: "Serie 5",
                values: [12, 14, 18, 25, 32, 64, 77, 64, 32, 25, 18, 14, 12],
            },
        ],
        wrapperClass: '.vue-ui-table-sparkline',
        config: { responsiveBreakpoint: 200 }
    },
    {
        name: 'VueUiThermometer',
        dataset: {
            value: 37,
            from: -100,
            to: 100,
            steps: 20,
        },
        wrapperClass: '.vue-ui-thermometer',
        config: {
            style: {
                chart: {
                    padding: {
                        left: 200,
                        right: 200
                    }
                }
            }
        }
    },
    {
        name: 'VueUiTiremarks',
        dataset: { percentage: 10 },
        wrapperClass: '.vue-ui-tiremarks'
    },
    {
        name: 'VueUiTreemap',
        dataset: [
            {
                name: 'S1',
                value: 100,
                children: [
                    {
                        name: 'S1 - C1',
                        value: 50
                    },
                    {
                        name: 'S1 -C2',
                        value: 25
                    },
                    {
                        name: 'S1 - C3',
                        value: 12.5,
                        children: [
                            {
                                name: 'S1 - C3 - CC1',
                                value: 6
                            },
                            {
                                name: 'S1 - C3 - CC2',
                                value: 6.5
                            },
                        ]
                    }
                ]
            },
            {
                name: 'S2',
                value: 200,
                children: [
                    {
                        name: 'S2 - C1',
                        value: 100
                    },
                    {
                        name: 'S2 - C2',
                        value: 50
                    },
                    {
                        name: 'S2 - C3',
                        value: 25
                    }
                ]
            },
            {
                name: 'S3',
                value: 100,
                children: [
                    {
                        name: 'S3 - C1',
                        value: 50
                    },
                    {
                        name: 'S3 - C2',
                        value: 25
                    },
                    {
                        name: 'S3 - C3',
                        value: 12.5
                    }
                ]
            },
            {
                name: 'S4',
                value: 20,
                children: [
                    {
                        name: 'S3 - C1',
                        value: 10
                    },
                    {
                        name: 'S3 - C2',
                        value: 5
                    },
                    {
                        name: 'S3 - C3',
                        value: 2.5
                    }
                ]
            },
            {
                name: 'S5',
                value: 10,
                children: [
                    {
                        name: 'S3 - C1',
                        value: 5
                    },
                    {
                        name: 'S3 - C2',
                        value: 2.5
                    },
                    {
                        name: 'S3 - C3',
                        value: 1.125
                    }
                ]
            },
        ],
        wrapperClass: '.vue-ui-treemap',
    },
    {
        name: 'VueUiVerticalBar',
        dataset: [
            {
                name: "Serie 1",
                value: 100.987987,
                children: [
                    {
                        name: "serie 1 child 1",
                        value: 80
                    },
                    {
                        name: "serie 1 child 2",
                        value: 20
                    },
                ]
            },
            {
                name: "Serie 2",
                value: 345,
            },
            {
                name: "Serie 3",
                value: 210,
            },
            {
                name: "Serie 4",
                value: 188,
            },
            {
                name: "Serie 5",
                value: 120,
                children: [
                    {
                        name: "Serie 5 child 1",
                        value: 60.1234,
                    },
                    {
                        name: "Serie 5 child 2",
                        value: 20,
                    },
                    {
                        name: "Serie 5 child 3",
                        value: 40,
                    },
                ]
            }
        ],
        wrapperClass: '.vue-ui-vertical-bar'
    },
    {
        name: 'VueUiWaffle',
        dataset: [
            {
                name: 'Lorem Ipsum',
                values: [100.27],
            },
            {
                name: 'Dolor Amet',
                values: [66.3367]
            },
            {
                name: 'Dignissimos Ducimus',
                values: [44.25]
            }
        ],
        wrapperClass: '.vue-ui-waffle'
    },
    {
        name: 'VueUiWheel',
        dataset: { percentage: 50 },
        wrapperClass: '.vue-ui-wheel'
    },
    {
        name: 'VueUiXy',
        dataset: [
            {
                name: 'S',
                series: (function IIFE(n, m) {
                    const arr = [];
                    for (let i = 0; i < n; i += 1) {
                        arr.push(i % 2 === 0 ? i : -i)
                    }
                    return arr
                })(20, 100),
                type: 'line'
            }
        ],
        wrapperClass: '.vue-ui-xy'
    },
    {
        name: 'VueUiQuickChart',
        dataset: [1, 2, -3, 5, 8],
        wrapperClass: '.vue-ui-quick-chart'
    },
    {
        name: 'VueUiSparkTrend',
        dataset: (function IIFE(n, m) {
            const arr = [];
            for (let i = 0; i < n; i += 1) {
                arr.push(i % 2 === 0 ? i : - i)
            }
            return arr
        })(10, 100),
        wrapperClass: '.vue-ui-spark-trend'
    },
    {
        name: 'VueUiStripPlot',
        dataset: [
            {
                name: "Asia",
                plots: [
                    { name: "Shanghai", value: 24.9 },
                    { name: "Beijing", value: 21.9 },
                    { name: "Delhi", value: 16.8 },
                    { name: "Guangzhou", value: 16.1 },
                    { name: "Istanbul", value: 15.6 },
                    { name: "Chengdu", value: 15.4 },
                    { name: "Mumbai", value: 15.4 },
                    { name: "Karachi", value: 14.9 },
                    { name: "Shenzen", value: 14.7 },
                    { name: "Tokyo", value: 14 },
                ]
            },
            {
                name: "Africa",
                plots: [
                    { name: "Kinshasa", value: 17.1 },
                    { name: "Lagos", value: 14.9 },
                    { name: "Cairo", value: 9.3 },
                    { name: "Johannesburg", value: 5.6 },
                    { name: "Giza", value: 5.6 },
                    { name: "Khartoum", value: 5.3 },
                    { name: "Abidjan", value: 5 },
                    { name: "Alexandria", value: 4.9 },
                    { name: "Dar es Salaam", value: 4.7 },
                    { name: "Nairobi", value: 4.4 },
                ]
            }],
        wrapperClass: '.vue-ui-strip-plot'
    },
    {
        name: 'VueUiDumbbell',
        dataset: [
            { name: 'Sweden', start: 5000, end: 7100 },
            { name: 'Korea, Rep.', start: 4900, end: 7050 },
            { name: 'Iceland', start: 6500, end: 8000 },
            { name: 'Finland', start: 6400, end: 7600 },
            { name: 'Norway', start: 5400, end: 6050 },
            { name: 'Ireland', start: 3000, end: 2000 }
        ],
        wrapperClass: '.vue-ui-dumbbell'
    },
    {
        name: 'VueUiWordCloud',
        dataset: 'Lorem ipsum dolor sit amet Lorem Lorem Lorem sit sit ipsum',
        wrapperClass: '.vue-ui-word-cloud'
    },
    {
        name: 'VueUiXyCanvas',
        dataset: [
            {
                name: 'S',
                series: (function IIFE(n, m) {
                    const arr = [];
                    for (let i = 0; i < n; i += 1) {
                        arr.push(i % 2 === 0 ? i : -i)
                    }
                    return arr
                })(20, 100),
                type: 'line'
            }
        ],
        wrapperClass: '.vue-ui-xy-canvas'
    },
    {
        name: 'VueUiFlow',
        dataset: [
            ['A1', 'B1', 10],
            ['A1', 'B2', 10],
            ['B1', 'C1', 5],
            ['B1', 'C2', 5],
            ['B1', 'C3', 5],
            ['B1', 'C4', 5],
            ['A2', 'B1', 10],
            ['B2', 'C5', 10],
            ['C3', 'D1', 2],
            ['C4', 'D1', 2],
            ['C5', 'D1', 2],
            ['C2', 'D2', 2],
            ['C3', 'D2', 1],
        ],
        wrapperClass: '.vue-ui-flow'
    },
    {
        name: 'VueUiParallelCoordinatePlot',
        dataset: [
            {
                name: "Series 1",
                shape: "triangle",
                series: [
                    {
                        name: 'Item 1.1',
                        values: [1200, 300, 12, 1.2],
                        comments: ['', '', 'This is some sort of comment', '']
                    },
                    {
                        name: 'Item 1.2',
                        values: [1000, 100, 10, 1]
                    },
                    {
                        name: 'Item 1.3',
                        values: [-800, 85, 8.5, 0.85]
                    },
                ]
            },
            {
                name: "Series 2",
                series: [
                    {
                        name: 'Item 2.1',
                        values: [2300, 230, 23, 2.3]
                    },
                    {
                        name: 'Item 2.2',
                        values: [2500, 250, 25, 2.5]
                    },
                    {
                        name: 'Item 2.3',
                        values: [2800, 280, 28, 2.8]
                    },
                ]
            },
        ],
        wrapperClass: '.vue-ui-pcp'
    },
    {
        name: 'VueUiTimer',
        dataset: undefined,
        wrapperClass: '.vue-ui-timer'
    },
    {
        name: 'VueUiCarouselTable',
        dataset: {
            head: ['Col1', 'col2', 'col3', 'col4', 'col 5', 'col 6', 'col 7'],
            body: (function IIFE(n) {
                let arr = [];
                for (let i = 0; i < n; i += 1) {
                    arr.push([
                        i + 1,
                        i + 2,
                        i + 3,
                        i + 4,
                        i + 5,
                        i + 6,
                        i + 7,
                    ])
                }
                return arr
            })(10)
        },
        wrapperClass: '.vue-ui-carousel-table'
    },
    {
        name: 'VueUiGizmo',
        dataset: 66,
        wrapperClass: '.vue-ui-gizmo'
    },
    {
        name: 'VueUiStackbar',
        dataset: [
            {
                name: "Series 1",
                series: [
                    10, 20, 30, 10, 20, 4, 5
                ],
            },
            {
                name: "Series 2",
                series: [20, 40, -60, 20, 10],
            },
            {
                name: "Series 3",
                series: [20, 40, 60, 20, 10],
            },
        ],
        wrapperClass: '.vue-ui-stackbar'
    },
    {
        name: 'VueUiBullet',
        dataset:{
            value: -20,
            target: -10,
            segments: [
                {
                    name: 'Low',
                    from: -100,
                    to: -30,
                },
                {
                    name: 'Medium',
                    from: -30,
                    to: 0,
                },
                {
                    name: 'High',
                    from: 0,
                    to: 100,
                }
            ]
        },
        wrapperClass: '.vue-ui-bullet'
    },
    {
        name: 'VueUiFunnel',
        dataset: [
            {
                name: 'Lead',
                value: 7745.8234576
            },
            {
                name: 'Opportunity',
                value: 5468
            },
            {
                name: 'Qualified',
                value: 4238
            },
            {
                name: 'Sold',
                value: 2025
            },
            {
                name: 'Retained',
                value: 1520
            },
        ],
        wrapperClass: '.vue-ui-funnel'
    },
    {
        name: 'VueUiHistoryPlot',
        dataset:[
            {
                name: 'Series 1',
                values: [
                    { x: 2, y: 0, label: 'T1'},
                    { x: 18, y: 0.2, label: 'T2'},
                    { x: 21, y: 0.8, label: 'T3'},
                    { x: 19, y: 1.2, label: 'T4'},
                ]
            },
            {
                name: 'Series 2',
                values: [
                    { x: 22, y: 2, label: 'T1'},
                    { x: 44, y: 4, label: 'T2'},
                    { x: 65, y: 3, label: 'T3'},
                    { x: 12, y: 2.5, label: 'T4'},
                ],
            },
        ],
        wrapperClass: '.vue-ui-history-plot'
    },
    {
        name: 'VueUiCirclePack',
        dataset: (function IIFE(){
            const arr = [];
            for(let i = 0; i < 12; i += 1) {
                arr.push({
                    name: `d_${i}`,
                    value: i
                })
            }
            return arr;
        })(),
        wrapperClass: '.vue-ui-circle-pack'
    }
];
