# Storybook migration coverage

Storybook 10.6.3 with Vue 3 + Vite replaces the Cypress component workflow.
The Vitest addon runs story `play` functions in Playwright Chromium. The existing
Vitest unit suite remains independent in `vitest.config.js`.

## Coverage

All 69 previous spec files are represented by 227 interaction stories. The catalog
adds 306 stories covering all 75 public component exports (533 total). No scenarios
were excluded or disabled. The former SparkStackbar `it.only` was removed, so both
of its cases now execute. The JSON map beside the stories records each original
case name and its named story export.

| Previous spec                                          | Story equivalent                                                                                                                  | Cases |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----: |
| `src/components/vue-data-ui.cy.js`                     | [stories/components/vue-data-ui.stories.js](../stories/components/vue-data-ui.stories.js)                                         |    65 |
| `src/components/vue-ui-3d-bar.cy.js`                   | [stories/components/vue-ui-3d-bar.stories.js](../stories/components/vue-ui-3d-bar.stories.js)                                     |     4 |
| `src/components/vue-ui-age-pyramid.cy.js`              | [stories/components/vue-ui-age-pyramid.stories.js](../stories/components/vue-ui-age-pyramid.stories.js)                           |     1 |
| `src/components/vue-ui-annotator.cy.js`                | [stories/components/vue-ui-annotator.stories.js](../stories/components/vue-ui-annotator.stories.js)                               |     1 |
| `src/components/vue-ui-bullet.cy.js`                   | [stories/components/vue-ui-bullet.stories.js](../stories/components/vue-ui-bullet.stories.js)                                     |     1 |
| `src/components/vue-ui-bump.cy.js`                     | [stories/components/vue-ui-bump.stories.js](../stories/components/vue-ui-bump.stories.js)                                         |     1 |
| `src/components/vue-ui-candlestick.cy.js`              | [stories/components/vue-ui-candlestick.stories.js](../stories/components/vue-ui-candlestick.stories.js)                           |     1 |
| `src/components/vue-ui-carousel-table.cy.js`           | [stories/components/vue-ui-carousel-table.stories.js](../stories/components/vue-ui-carousel-table.stories.js)                     |     1 |
| `src/components/vue-ui-chestnut.cy.js`                 | [stories/components/vue-ui-chestnut.stories.js](../stories/components/vue-ui-chestnut.stories.js)                                 |     2 |
| `src/components/vue-ui-circle-pack.cy.js`              | [stories/components/vue-ui-circle-pack.stories.js](../stories/components/vue-ui-circle-pack.stories.js)                           |     1 |
| `src/components/vue-ui-cursor.cy.js`                   | [stories/components/vue-ui-cursor.stories.js](../stories/components/vue-ui-cursor.stories.js)                                     |     1 |
| `src/components/vue-ui-dag.cy.js`                      | [stories/components/vue-ui-dag.stories.js](../stories/components/vue-ui-dag.stories.js)                                           |     1 |
| `src/components/vue-ui-digits.cy.js`                   | [stories/components/vue-ui-digits.stories.js](../stories/components/vue-ui-digits.stories.js)                                     |    11 |
| `src/components/vue-ui-donut-evolution.cy.js`          | [stories/components/vue-ui-donut-evolution.stories.js](../stories/components/vue-ui-donut-evolution.stories.js)                   |     1 |
| `src/components/vue-ui-donut.cy.js`                    | [stories/components/vue-ui-donut.stories.js](../stories/components/vue-ui-donut.stories.js)                                       |     2 |
| `src/components/vue-ui-dumbbell.cy.js`                 | [stories/components/vue-ui-dumbbell.stories.js](../stories/components/vue-ui-dumbbell.stories.js)                                 |     1 |
| `src/components/vue-ui-flow.cy.js`                     | [stories/components/vue-ui-flow.stories.js](../stories/components/vue-ui-flow.stories.js)                                         |     1 |
| `src/components/vue-ui-funnel.cy.js`                   | [stories/components/vue-ui-funnel.stories.js](../stories/components/vue-ui-funnel.stories.js)                                     |     1 |
| `src/components/vue-ui-galaxy.cy.js`                   | [stories/components/vue-ui-galaxy.stories.js](../stories/components/vue-ui-galaxy.stories.js)                                     |     2 |
| `src/components/vue-ui-gauge.cy.js`                    | [stories/components/vue-ui-gauge.stories.js](../stories/components/vue-ui-gauge.stories.js)                                       |     1 |
| `src/components/vue-ui-geo.cy.js`                      | [stories/components/vue-ui-geo.stories.js](../stories/components/vue-ui-geo.stories.js)                                           |     1 |
| `src/components/vue-ui-gizmo.cy.js`                    | [stories/components/vue-ui-gizmo.stories.js](../stories/components/vue-ui-gizmo.stories.js)                                       |     2 |
| `src/components/vue-ui-heatmap.cy.js`                  | [stories/components/vue-ui-heatmap.stories.js](../stories/components/vue-ui-heatmap.stories.js)                                   |     1 |
| `src/components/vue-ui-hill.cy.js`                     | [stories/components/vue-ui-hill.stories.js](../stories/components/vue-ui-hill.stories.js)                                         |    11 |
| `src/components/vue-ui-history-plot.cy.js`             | [stories/components/vue-ui-history-plot.stories.js](../stories/components/vue-ui-history-plot.stories.js)                         |     2 |
| `src/components/vue-ui-horizontal-bar.cy.js`           | [stories/components/vue-ui-horizontal-bar.stories.js](../stories/components/vue-ui-horizontal-bar.stories.js)                     |     2 |
| `src/components/vue-ui-kpi.cy.js`                      | [stories/components/vue-ui-kpi.stories.js](../stories/components/vue-ui-kpi.stories.js)                                           |     2 |
| `src/components/vue-ui-mini-loader.cy.js`              | [stories/components/vue-ui-mini-loader.stories.js](../stories/components/vue-ui-mini-loader.stories.js)                           |     3 |
| `src/components/vue-ui-molecule.cy.js`                 | [stories/components/vue-ui-molecule.stories.js](../stories/components/vue-ui-molecule.stories.js)                                 |     1 |
| `src/components/vue-ui-mood-radar.cy.js`               | [stories/components/vue-ui-mood-radar.stories.js](../stories/components/vue-ui-mood-radar.stories.js)                             |     1 |
| `src/components/vue-ui-nested-donuts.cy.js`            | [stories/components/vue-ui-nested-donuts.stories.js](../stories/components/vue-ui-nested-donuts.stories.js)                       |     2 |
| `src/components/vue-ui-onion.cy.js`                    | [stories/components/vue-ui-onion.stories.js](../stories/components/vue-ui-onion.stories.js)                                       |     2 |
| `src/components/vue-ui-parallel-coordinate-plot.cy.js` | [stories/components/vue-ui-parallel-coordinate-plot.stories.js](../stories/components/vue-ui-parallel-coordinate-plot.stories.js) |     2 |
| `src/components/vue-ui-quadrant.cy.js`                 | [stories/components/vue-ui-quadrant.stories.js](../stories/components/vue-ui-quadrant.stories.js)                                 |     2 |
| `src/components/vue-ui-quick-chart.cy.js`              | [QuickChart scenarios](../stories/components/quick-chart/)                                                                        |    10 |
| `src/components/vue-ui-radar.cy.js`                    | [stories/components/vue-ui-radar.stories.js](../stories/components/vue-ui-radar.stories.js)                                       |     2 |
| `src/components/vue-ui-rating.cy.js`                   | [stories/components/vue-ui-rating.stories.js](../stories/components/vue-ui-rating.stories.js)                                     |     1 |
| `src/components/vue-ui-relation-circle.cy.js`          | [stories/components/vue-ui-relation-circle.stories.js](../stories/components/vue-ui-relation-circle.stories.js)                   |     1 |
| `src/components/vue-ui-rings.cy.js`                    | [stories/components/vue-ui-rings.stories.js](../stories/components/vue-ui-rings.stories.js)                                       |     2 |
| `src/components/vue-ui-scatter.cy.js`                  | [stories/components/vue-ui-scatter.stories.js](../stories/components/vue-ui-scatter.stories.js)                                   |     2 |
| `src/components/vue-ui-skeleton.cy.js`                 | [stories/components/vue-ui-skeleton.stories.js](../stories/components/vue-ui-skeleton.stories.js)                                 |     1 |
| `src/components/vue-ui-smiley.cy.js`                   | [stories/components/vue-ui-smiley.stories.js](../stories/components/vue-ui-smiley.stories.js)                                     |     1 |
| `src/components/vue-ui-sparkbar.cy.js`                 | [stories/components/vue-ui-sparkbar.stories.js](../stories/components/vue-ui-sparkbar.stories.js)                                 |     4 |
| `src/components/vue-ui-sparkhistogram.cy.js`           | [stories/components/vue-ui-sparkhistogram.stories.js](../stories/components/vue-ui-sparkhistogram.stories.js)                     |     2 |
| `src/components/vue-ui-sparkline.cy.js`                | [stories/components/vue-ui-sparkline.stories.js](../stories/components/vue-ui-sparkline.stories.js)                               |     4 |
| `src/components/vue-ui-sparkstackbar.cy.js`            | [stories/components/vue-ui-sparkstackbar.stories.js](../stories/components/vue-ui-sparkstackbar.stories.js)                       |     2 |
| `src/components/vue-ui-stackbar.cy.js`                 | [stories/components/vue-ui-stackbar.stories.js](../stories/components/vue-ui-stackbar.stories.js)                                 |     2 |
| `src/components/vue-ui-stackline.cy.js`                | [stories/components/vue-ui-stackline.stories.js](../stories/components/vue-ui-stackline.stories.js)                               |     1 |
| `src/components/vue-ui-strip-plot.cy.js`               | [stories/components/vue-ui-strip-plot.stories.js](../stories/components/vue-ui-strip-plot.stories.js)                             |     2 |
| `src/components/vue-ui-table-heatmap.cy.js`            | [stories/components/vue-ui-table-heatmap.stories.js](../stories/components/vue-ui-table-heatmap.stories.js)                       |     1 |
| `src/components/vue-ui-table-sparkline.cy.js`          | [stories/components/vue-ui-table-sparkline.stories.js](../stories/components/vue-ui-table-sparkline.stories.js)                   |     1 |
| `src/components/vue-ui-thermometer.cy.js`              | [stories/components/vue-ui-thermometer.stories.js](../stories/components/vue-ui-thermometer.stories.js)                           |     1 |
| `src/components/vue-ui-tiremarks.cy.js`                | [stories/components/vue-ui-tiremarks.stories.js](../stories/components/vue-ui-tiremarks.stories.js)                               |     1 |
| `src/components/vue-ui-treemap.cy.js`                  | [stories/components/vue-ui-treemap.stories.js](../stories/components/vue-ui-treemap.stories.js)                                   |     3 |
| `src/components/vue-ui-waffle.cy.js`                   | [stories/components/vue-ui-waffle.stories.js](../stories/components/vue-ui-waffle.stories.js)                                     |     2 |
| `src/components/vue-ui-wheel.cy.js`                    | [stories/components/vue-ui-wheel.stories.js](../stories/components/vue-ui-wheel.stories.js)                                       |     1 |
| `src/components/vue-ui-word-cloud.cy.js`               | [stories/components/vue-ui-word-cloud.stories.js](../stories/components/vue-ui-word-cloud.stories.js)                             |     1 |
| `src/components/vue-ui-xy-canvas.cy.js`                | [stories/components/vue-ui-xy-canvas.stories.js](../stories/components/vue-ui-xy-canvas.stories.js)                               |     2 |
| `src/components/vue-ui-xy.cy.js`                       | [stories/components/vue-ui-xy.stories.js](../stories/components/vue-ui-xy.stories.js)                                             |     2 |
| `src/atoms/BaseDirectionPad.cy.js`                     | [stories/atoms/BaseDirectionPad.stories.js](../stories/atoms/BaseDirectionPad.stories.js)                                         |     3 |
| `src/atoms/DataTable.cy.js`                            | [stories/atoms/DataTable.stories.js](../stories/atoms/DataTable.stories.js)                                                       |     1 |
| `src/atoms/Legend.cy.js`                               | [stories/atoms/Legend.stories.js](../stories/atoms/Legend.stories.js)                                                             |     2 |
| `src/atoms/PenAndPaper.cy.js`                          | [stories/atoms/PenAndPaper.stories.js](../stories/atoms/PenAndPaper.stories.js)                                                   |     4 |
| `src/atoms/Shape.cy.js`                                | [stories/atoms/Shape.stories.js](../stories/atoms/Shape.stories.js)                                                               |     7 |
| `src/atoms/SlicerPreview.cy.js`                        | [stories/atoms/SlicerPreview.stories.js](../stories/atoms/SlicerPreview.stories.js)                                               |     7 |
| `src/atoms/Title.cy.js`                                | [stories/atoms/Title.stories.js](../stories/atoms/Title.stories.js)                                                               |     2 |
| `src/atoms/Tooltip.cy.js`                              | [stories/atoms/Tooltip.stories.js](../stories/atoms/Tooltip.stories.js)                                                           |     2 |
| `src/atoms/UserOptions.cy.js`                          | [stories/atoms/UserOptions.stories.js](../stories/atoms/UserOptions.stories.js)                                                   |     5 |
| `tests/useObjectBindings.cy.js`                        | [stories/composables/useObjectBindings.stories.js](../stories/composables/useObjectBindings.stories.js)                           |     8 |

## Assertion adaptations

- Stable `data-cy` selectors are retained for chart geometry. They are test hooks,
  not a dependency on the removed runner; the production build still strips them.
- Assertions now use `storybook/test` expectations and `waitFor`, with native DOM
  attributes, computed styles, and Testing Library events. Collection visibility
  preserves the original meaning: at least one member is visible. Negative
  visibility assertions check all members.
- Each scenario gets fresh parent state, spies, and aliases. Vue Test Utils mounts
  inside the Storybook canvas for cases requiring emitted payloads, exposed methods,
  reactive models, or remounting. Cleanup restores spies, unmounts components, and
  removes teleported content. The public catalog uses normal component/args stories.
- Fixed sleeps were replaced with state polling and Vue ticks. Lazy table instances
  are awaited before opening. Annotation text input waits for the component's
  existing click guard before typing. No production component behavior changed.
- Annotation circle queries exclude the newer resize handle while retaining the
  original drawn circle assertion. Drawing, undo, rectangle, arrow, freehand, and
  text content checks remain.
- Cursor events use its current `config.parentId` setting and current coordinate
  calculation rather than the obsolete standalone prop and old radius assumption.
- Canvas hover coordinates are inside its drawing area. Scatter performance hit
  testing converts a rendered path point into screen coordinates. Both retain their
  tooltip and rendered-selection checks; Canvas also checks pixel alpha.
- XY's random dataset generator is deterministic. Fixture callbacks are preserved
  by a recursive plain-data clone rather than JSON serialization.
- The object-binding composable's eight browser scenarios remain interaction
  stories, including v-model, nested writes, arrays, delimiters, and warning checks.
  Existing unit tests were retained unchanged.

There are no unmigrated tests. The original download-clear command had no callers;
its Node task and example support boilerplate were removed. Historical spec paths
in this document and `stories/migration-map.json` intentionally identify the source
of the migrated coverage.

## Running and extending

See [CONTRIBUTING.md](../CONTRIBUTING.md#tests-and-component-development) for commands,
new story conventions, and interaction examples. Storybook's production build is
`storybook-static/`; the published library remains restricted to `dist/`.

Configuration follows the official [Vue + Vite integration](https://storybook.js.org/docs/get-started/frameworks/vue3-vite),
[Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon),
and [interaction testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
documentation. Automatic legacy Vue docgen is disabled because it rejects existing
prop defaults; dataset/config controls are declared explicitly in catalog stories.

QuickChart scenarios are split into individual files in `stories/components/quick-chart/`
to keep each dataset/rendering and emitted-payload example independently readable.

## Verification (22 October 2026)

- Dependency installation and lockfile update: passed; no Cypress dependency remains.
- `npm run storybook -- --ci`: started successfully at http://127.0.0.1:6006/.
- `npm run build:storybook`: passed (bundle-size warning only).
- `npm run prod`: passed formatting, declaration type checks, 52 unit test files
  (1,721 passed and three existing TODOs), 533 browser stories, and the production
  library build. Its existing `preprod` lifecycle was preserved.
- After splitting QuickChart scenarios into smaller files, all ten scenarios passed
  again. The 3D bar reactivity promise is explicitly awaited and its four scenarios
  were checked separately.
- `npm pack --dry-run --json`: 359 files, restricted to `dist/`, README, LICENSE,
  and package metadata. No Storybook configuration, stories, or test tooling is
  packaged; built JavaScript has no Storybook or Cypress imports.

No remaining migration blockers. Automatic prop-doc extraction is disabled as
noted above; controls are explicit. Browser verification uses Chromium. Node 26
prints an upstream module-registration deprecation notice; builds and tests pass.
