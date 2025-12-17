/**
 * For vue-ui-donut
 * 
 * Computes clustered label layouts for small donut arcs in 'classic' donut mode.
 *
 * This composable:
 * - identifies arcs that are too small to host inline labels,
 * - groups them by quadrant (top/bottom, left/right),
 * - stacks their labels into vertical bands on each side of the donut,
 * - computes marker positions and connector paths (angled or curved),
 * - and returns a reactive map of layout instructions keyed by arc index.
 *
 * The result is used by the rendering layer to draw labels, markers,
 * and connectors without overlap while preserving visual balance
 * and animation stability.
 */

/**
 * NOTE: this is not yet perfect, especially for the ANGLED version, which in some cases sucks because
 * some paths do not connect directly to the arcs when Y is below the arc
 */

import { computed } from "vue";

export function useSmallArcLayoutsClassic(dependencies) {
    const {
        FINAL_CONFIG,
        noGhostDonut,
        svg,
        padding,
        labels_inline_fontSize,
        minSize,
        findArcMidpoint,
        calcMarkerOffsetX,
        calcMarkerOffsetY,
        animatingIndex,
        segregated,
        isSmallArc
    } = dependencies;

    const smallArcLayoutsClassic = computed(() => {
        if (FINAL_CONFIG.value.type !== 'classic') return {};

        const layouts = {};
        const arcs = noGhostDonut.value || [];
        if (!arcs.length) return layouts;

        const centerX = svg.value.width / 2;
        const centerY = svg.value.height / 2;

        /**
         * Available vertical placement range for clustered labels.
         * Margin from the drawing area's top to avoid undesirable autoSize aretefacts
         */
        const topPadding = padding.value.top + 16;
        const bottomPadding = svg.value.height - padding.value.bottom - 16;
        const fontSize = labels_inline_fontSize.value;
        const fontBaselineOffset = fontSize / 3;

        /**
         * Base height for a single small label:
         * - `percentage`
         * - `name`
         * - extra lines are added later for each datapoint, if name contains \n
         */
        const baseLineHeight = fontSize * 1.5;

        // Horizontal gap between the marker dot and the text block.
        const markerTextGap = 8;

        const radialOffset = 6; // Same offset as normal markers

        /**
         * X positions of the left and right bands where clustered markers are positioned.
         * All clustered labels on the left share leftBandMarkerX; similarly on the right.
         */
        const leftBandMarkerX = centerX - (minSize.value + radialOffset);
        const rightBandMarkerX = centerX + (minSize.value + radialOffset);

        const isCurved = !!FINAL_CONFIG.value.style.chart.layout.curvedMarkers;

        function makeConnectorPathForSmallArcs({ midX, midY, bandX, bandY }) {
            /**
             * ANGLED MODE (when curvedMarkers = false)
             * 2 segment marker connector
             * - from arc midpoint to an “elbow” aligned vertically with the band marker
             * - then from elbow to the band marker
             */
            if (!isCurved) {
                const elbowX = midX;
                const elbowY = bandY;
                return `M ${midX} ${midY} L ${elbowX} ${elbowY} L ${bandX} ${bandY}`;
            }

            /**
             * CURVED MODE
             * Determine which side relative to the donut center
             */
            const side = bandX < centerX ? -1 : 1; // -1: left; 1: right

            /**
             * Vector and distance from arc midpoint to band marker
             * Used to classify small vs longer connectors and scale curve strengths
             */
            const deltaX = bandX - midX;
            const deltaY = bandY - midY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;

            /**
             * Radial vector from chart center to arc midpoint
             * Used to bias the curve outwards from the donut (avoid curving inward / behind the ring (kinda)).
             */
            const radialDeltaX = midX - centerX;
            const radialDeltaY = midY - centerY;
            const radialLength = Math.sqrt(radialDeltaX * radialDeltaX + radialDeltaY * radialDeltaY) || 1;

            // Normalized radial direction (unit vector)
            const radialUnitX = radialDeltaX / radialLength;
            const radialUnitY = radialDeltaY / radialLength;

            /**
             * Safety ring to ensure control points stay outside the donut
             * safeRadius is slightly larger than the radial distance of the arc midpoint.
             */
            const safePadding = 9;
            const safeRadius = radialLength + safePadding;

            function pushOutside({ x, y }) {
                /**
                 * Recompute the control point’s distance to center
                 * Push it outward along the same direction if it falls inside safeRadius
                 */
                const fromCenterX = x - centerX;
                const fromCenterY = y - centerY;
                const fromCenterLength = Math.sqrt(fromCenterX * fromCenterX + fromCenterY * fromCenterY) || 1;

                if (fromCenterLength >= safeRadius) return { x, y };

                const factor = safeRadius / fromCenterLength;
                return {
                    x: centerX + fromCenterX * factor,
                    y: centerY + fromCenterY * factor
                };
            }

            /**
             * SMALL CONNECTORS
             * Use Q curves to avoid over-shaping and to keep a single gentle bend, for short paths
             */
            const SHORT_CONNECTOR_THRESHOLD = 56;
            if (distance < SHORT_CONNECTOR_THRESHOLD) {
                // Unit direction from arc midpoint to band marker
                const directionUnitX = deltaX / distance;
                const directionUnitY = deltaY / distance;

                /**
                 * Perpendicular unit vector to the straight direction
                 * lateral bulge to make the curve visible and pleasant
                 */
                let perpendicularUnitX = -directionUnitY;
                let perpendicularUnitY = directionUnitX;

                /**
                 * Decide which perpendicular is outward from donut center
                 * Compare squared distances of two probe points from the center and pick the farther one.
                 */
                const midpointX = (midX + bandX) * 0.5;
                const midpointY = (midY + bandY) * 0.5;

                const probeX = midpointX + perpendicularUnitX;
                const probeY = midpointY + perpendicularUnitY;

                const probeDistance =
                    (probeX - centerX) * (probeX - centerX) +
                    (probeY - centerY) * (probeY - centerY);

                const oppositeProbeX = midpointX - perpendicularUnitX;
                const oppositeProbeY = midpointY - perpendicularUnitY;

                const oppositeProbeDistance =
                    (oppositeProbeX - centerX) * (oppositeProbeX - centerX) +
                    (oppositeProbeY - centerY) * (oppositeProbeY - centerY);

                // Flip the perpendicular if the opposite direction is more outwards
                if (oppositeProbeDistance > probeDistance) {
                    perpendicularUnitX = -perpendicularUnitX;
                    perpendicularUnitY = -perpendicularUnitY;
                }

                /**
                 * Prevent overly curly artefacts for small connectors
                 * Place the control point closer to the label anchor than to the arc midpoint
                 */
                const t = 0.78;
                const baseX = midX + deltaX * t;
                const baseY = midY + deltaY * t;

                /**
                 * Distance-dependent offset using smoothstep easing
                 * - normalized maps distance into 0 to 1
                 * - eased smooths the transition to avoid abrupt changes between arcs
                 */
                const normalized = Math.max(0, Math.min(1, (distance - 18) / (56 - 12))); // 0 to 1
                const eased = normalized * normalized * (3 - 2 * normalized);

                /**
                 * Offset controls perpendicular bulge (visual curvature)
                 * radialBias nudges outward to avoid paths from colliding with donut
                 */
                let offset = 2.5 + eased * 4.; // 2.5 to 7
                let radialBias = 1.0 + eased * 2.5; // 1 to 3.5

                // Slight reduction to keep the curve from looking too curly
                offset *= 0.90;

                /**
                 * Raw control point combines:
                 * - base point along the segment
                 * - perpendicular offset
                 * - slight radial push outward (radialBias)
                 */
                const rawControl = {
                    x: baseX + perpendicularUnitX * offset + radialUnitX * radialBias,
                    y: baseY + perpendicularUnitY * offset + radialUnitY * radialBias
                };

                // Ensure control point stays outside the safe donut radius.
                const control = pushOutside(rawControl);

                return `M ${midX} ${midY} Q ${control.x} ${control.y} ${bandX} ${bandY}`;
            }

            /**
             * LONGER CONNECTORS
             * Use a C curve to control both the exit direction from the arc and the approach into marker
             * This provides a smoother shape for longer distances than a single Q curve can
             */
            let outwardStrength = distance * 0.34;
            if (outwardStrength < 20) outwardStrength = 20;
            if (outwardStrength > 46) outwardStrength = 46;

            let horizontalPull = distance * 0.46;
            if (horizontalPull < 22) horizontalPull = 22;
            if (horizontalPull > 70) horizontalPull = 70;

            // First control point: push the curve outward along the radial direction
            const rawControlPoint1 = {
                x: midX + radialUnitX * outwardStrength,
                y: midY + radialUnitY * outwardStrength
            };

            /**
             * Second control point: places the approach handle on an outside “column” on the label side
             * Pulled closer to the label to avoid excessive ballooning
             */
            const outsideColumnX = centerX + side * Math.max(Math.abs(bandX - centerX), safeRadius);

            const rawControlPoint2 = {
                x: bandX - side * Math.min(horizontalPull, Math.abs(outsideColumnX - bandX) * 0.75),
                y: bandY
            };

            // Ensure both CP stay outside the safe donut radius
            const controlPoint1 = pushOutside(rawControlPoint1);
            const controlPoint2 = pushOutside(rawControlPoint2);

            return `M ${midX} ${midY} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${bandX} ${bandY}`;
        }

        /**
         * Computes the vertical space required to render a small-arc label,
         * taking into account multi-line names.
         *
         * The first line (percentage + first name line) is covered by `baseLineHeight`.
         * Each additional line in the arc name (separated by `\n`) adds extra height
         * using a tighter line height derived from the label font size.
         *
         * This value is used by the band placement algorithm to stack labels
         * without overlap.
         *
         * @param {string | null | undefined} arcName
         * Label name associated with the arc. Newline characters (`\n`) indicate additional text lines
         *
         * @returns {number}
         * Total height in pixels
         */
        function computeLabelHeightForArcName(arcName) {
            /**
             * Split the label name by newline to support multi-line labels
             * Only extra lines beyond the first add extra vertical height
             */
            const nameLines = String(arcName ?? "").split(/\n/g);
            const extraNameLines = Math.max(0, nameLines.length - 1);

            // Line height for additional name lines (slightly tighter than baseLineHeight).
            const lineHeight = fontSize * 1.2;

            // Total extra height contributed by additional name lines.
            const extraHeight = extraNameLines * lineHeight;

            // Final label height used by the band placement algorithm.
            return baseLineHeight + extraHeight;
        }

        function buildCandidateFromArc({ arc, index }) {
            // Compute the geometric midpoint of the arc path; used as connector start point.
            const { x: midX, y: midY } = findArcMidpoint(arc.path);

            /**
             * Compute the inline marker position for quadrant classification
             * This is NOT the final clustered marker, it is only a reference point near the arc
             */
            const inlineMarkerX = calcMarkerOffsetX(arc).x;
            const inlineMarkerY = calcMarkerOffsetY(arc) - 3.5;

            // Precompute label height for band stacking
            const labelHeight = computeLabelHeightForArcName(arc.name);

            /**
             * Candidate object contains all fields needed by:
             * - quadrant assignment
             * - sorting within quadrant
             * - final layout construction
             */
            return {
                arc,
                index,
                midX,
                midY,
                inlineMarkerX,
                inlineMarkerY,
                labelHeight
            };
        }

        /**
         * Builds a normalized candidate object from a donut arc containing
         * all precomputed geometry and layout metadata required for small arcs
         * label clustering.
         *
         * A candidate is an intermediate representation used to:
         * - assign the arc to a quadrant (top/bottom; left/right),
         * - sort arcs within that quadrant,
         * - compute connector paths and final label placement.
         *
         * This function performs all per-arc calculations once, so downstream
         * layout logic can remain simple and declarative.
         *
         * @param {Object} params
         * @param {Object} params.arc
         * The arc data object produced by the donut layout logic.
         * It must contain a valid SVG path (`arc.path`) and a label name (`arc.name`).
         *
         * @param {number} params.index
         * The index of the arc in the original dataset.
         * Used as a stable key and as a secondary sort criterion.
         *
         * @returns {Object}
         * A candidate object with all geometry and metadata needed for
         * small-arc clustering and layout.
         *
         * @returns {Object} return.arc
         * The original arc object.
         *
         * @returns {number} return.index
         * The index of the arc in the dataset.
         *
         * @returns {number} return.midX
         * X coordinate of the geometric midpoint of the arc path.
         *
         * @returns {number} return.midY
         * Y coordinate of the geometric midpoint of the arc path.
         *
         * @returns {number} return.inlineMarkerX
         * X coordinate of the arc’s inline marker reference point,
         * used only for quadrant classification.
         *
         * @returns {number} return.inlineMarkerY
         * Y coordinate of the arc’s inline marker reference point,
         * used only for quadrant classification.
         *
         * @returns {number} return.labelHeight
         * Precomputed vertical space, in pixels, required to render the label.
         */
        function isEligibleSmallArcCandidate(candidate) {
            /**
             * Extract series index (default to 0 if absent).
             * This index is used to skip arcs that are currently animated or segregated.
             */
            const { arc } = candidate;
            const seriesIndex = arc.seriesIndex ?? 0;

            // Exclude arcs that are being animated, to avoid layout jitter during transitions
            if (animatingIndex.value === seriesIndex) return false;

            // Exclude arcs that are “segregated” (hidden / separated) by legend interaction
            if (segregated.value.includes(seriesIndex)) return false;

            return isSmallArc(arc, seriesIndex);
        }

        function getQuadrantKey(candidate) {
            const isTop = candidate.inlineMarkerY < centerY;
            const isLeft = candidate.inlineMarkerX < centerX;
            if (isTop && isLeft) return 'TL';
            if (isTop && !isLeft) return 'TR';
            if (!isTop && isLeft) return 'BL';
            return 'BR';
        }

        function sortCandidatesForQuadrant(candidateList, quadrantKey) {
            /**
             * Top quadrants are sorted ascending by Y so labels stack from top to bottom
             * Bottom quadrants are sorted descending by Y so labels stack from bottom to top
             * Secondary sort by index ensures stability when Y positions are tied
             */
            const isTopBand = quadrantKey.startsWith("T");

            if (isTopBand) {
                candidateList.sort((a, b) => a.inlineMarkerY - b.inlineMarkerY || a.index - b.index);
                return;
            }

            candidateList.sort((a, b) => b.inlineMarkerY - a.inlineMarkerY || a.index - b.index);
        }

        function createLayoutEntry({ side, markerX, markerY, labelY, connectorPath }) {
            return {
                side,
                labelX: side === 'left' ? markerX - markerTextGap : markerX + markerTextGap,
                labelY: labelY + fontBaselineOffset,
                textAnchor: side === 'left' ? 'end' : 'start',
                markerX,
                markerY,
                connectorPath
            };
        }

        function placeCandidatesIntoBand({
            candidateList,
            side,
            bandMarkerX,
            startY,
            direction
        }) {
            /**
             * currentY is the running Y cursor for stacking labels in a band
             * Starts at the top band’s startY, or at the bottom band’s startY.
             */
            let currentY = startY;

            candidateList.forEach(candidate => {
                const { index, midX, midY, labelHeight } = candidate;

                /**
                 * Choose the label’s Y position based on stacking direction:
                 * - down: place at currentY, then advance downwards by labelHeight
                 * - up: decrement first, then place (stack upwards)
                 */
                let labelY;
                if (direction === 'down') {
                    labelY = currentY;
                    currentY += labelHeight;
                } else {
                    currentY -= labelHeight;
                    labelY = currentY;
                }

                // Marker is positioned on the same Y as the label baseline cluster line
                const markerY = labelY;
            
                const connectorPath = makeConnectorPathForSmallArcs({
                    midX,
                    midY,
                    bandX: bandMarkerX,
                    bandY: markerY
                });

                layouts[index] = createLayoutEntry({
                    side,
                    markerX: bandMarkerX,
                    markerY,
                    labelY,
                    connectorPath
                });
            });
        }

        /**
         * -----------------------------------------------------------------------------------------
         * STEP 1: BUILD CANDIDATES
         * -----------------------------------------------------------------------------------------
         * Convert every arc into a “candidate” (midpoint, reference marker, labelHeight),
         * then keep only candidates eligible for small-arc clustering.
         */
        const candidateList = arcs
            .map((arc, index) => buildCandidateFromArc({ arc, index }))
            .filter(isEligibleSmallArcCandidate);

        /**
         * -----------------------------------------------------------------------------------------
         * STEP 2: QUADRANTS PARTITION
         * -----------------------------------------------------------------------------------------
         * The quadrant map groups candidates so each group can be sorted and laid out independently
         */
        const candidatesByQuadrant = {
            TL: [],
            TR: [],
            BL: [],
            BR: []
        };

        candidateList.forEach(candidate => {
            candidatesByQuadrant[getQuadrantKey(candidate)].push(candidate);
        });

        /**
         * -----------------------------------------------------------------------------------------
         * STEP 3: SORT WITHIN EACH QUADRANT
         * -----------------------------------------------------------------------------------------
         * Sorting defines label stacking order to minimize path crossing
         */
        Object.keys(candidatesByQuadrant).forEach(quadrantKey => {
            sortCandidatesForQuadrant(candidatesByQuadrant[quadrantKey], quadrantKey);
        });

        /**
         * -----------------------------------------------------------------------------------------
         * STEP 4: POSITION BANDS & POPULATE LAYOUTS
         * -----------------------------------------------------------------------------------------
         * Top bands always place their candidates
         */
        placeCandidatesIntoBand({
            candidateList: candidatesByQuadrant.TL,
            side: 'left',
            bandMarkerX: leftBandMarkerX,
            startY: topPadding,
            direction: 'down'
        });

        placeCandidatesIntoBand({
            candidateList: candidatesByQuadrant.TR,
            side: 'right',
            bandMarkerX: rightBandMarkerX,
            startY: topPadding,
            direction: 'down'
        });

        /**
         * Bottom bands are only created when there is more than one candidate
         * (keeps layout cleaner when there is only a single bottom small arc).
         */
        if (candidatesByQuadrant.BL.length > 1) {
            placeCandidatesIntoBand({
                candidateList: candidatesByQuadrant.BL,
                side: 'left',
                bandMarkerX: leftBandMarkerX,
                startY: bottomPadding,
                direction: 'up'
            });
        }

        if (candidatesByQuadrant.BR.length > 1) {
            placeCandidatesIntoBand({
                candidateList: candidatesByQuadrant.BR,
                side: 'right',
                bandMarkerX: rightBandMarkerX,
                startY: bottomPadding,
                direction: 'up'
            });
        }

        return layouts;
    });

    return { smallArcLayoutsClassic };
}
