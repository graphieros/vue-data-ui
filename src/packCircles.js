/**
 *
 * A utility function to pack circles inside a rectangle.
 * This file improves the algorithmic code from Mike Bostock’s Observable notebook
 * https://observablehq.com/@mbostock/packing-circles-inside-a-rectangle with the following adaptations:
 *
 * - Keep the original front-chain packing for the global structure
 * - Pull the largest circles toward the center after the main packing pass
 * - Reposition only the smaller circles into interior gaps
 */

export function bounds(circles, pad = 0) {
    const x0 = circles.reduce(
        (value, { x, r }) => Math.min(value, x - r - pad),
        +Infinity,
    );
    const x1 = circles.reduce(
        (value, { x, r }) => Math.max(value, x + r + pad),
        -Infinity,
    );
    const y0 = circles.reduce(
        (value, { y, r }) => Math.min(value, y - r - pad),
        +Infinity,
    );
    const y1 = circles.reduce(
        (value, { y, r }) => Math.max(value, y + r + pad),
        -Infinity,
    );
    return [x0, y0, x1 - x0, y1 - y0];
}

export function scoreRectangle(node, width, height) {
    const circleA = node._;
    const circleB = node.next._;
    const distance = circleA.r + circleB.r;
    const centerX = (circleA.x * circleB.r + circleB.x * circleA.r) / distance;
    const centerY = (circleA.y * circleB.r + circleB.y * circleA.r) / distance;

    return Math.max(Math.abs(centerX * height), Math.abs(centerY * width));
}

// Unused for now: to be used for further improvement (nested packings)
export function scoreCircle(node) {
    const circleA = node._;
    const circleB = node.next._;
    const distance = circleA.r + circleB.r;
    const centerX = (circleA.x * circleB.r + circleB.x * circleA.r) / distance;
    const centerY = (circleA.y * circleB.r + circleB.y * circleA.r) / distance;

    return centerX * centerX + centerY * centerY;
}

export function pack(circles, height, width) {
    const score = scoreRectangle;
    const circleCount = circles.length;

    if (!circleCount) {
        return circles;
    }

    circles.sort((left, right) => right.r - left.r);

    let circleA;
    let circleB;
    let circleC;

    circleA = circles[0];
    circleA.x = 0;
    circleA.y = 0;

    if (!(circleCount > 1)) {
        return circles;
    }

    circleB = circles[1];
    circleA.x = -circleB.r;
    circleB.x = circleA.r;
    circleB.y = 0;

    if (!(circleCount > 2)) {
        centerLargestCircles(circles, width, height);
        return circles;
    }

    place(circleB, circleA, (circleC = circles[2]));

    circleA = new Node(circleA);
    circleB = new Node(circleB);
    circleC = new Node(circleC);

    circleA.next = circleC.previous = circleB;
    circleB.next = circleA.previous = circleC;
    circleC.next = circleB.previous = circleA;

    packLoop: for (let index = 3; index < circleCount; ++index) {
        place(circleA._, circleB._, (circleC = circles[index]));
        circleC = new Node(circleC);

        let forwardNode = circleB.next;
        let backwardNode = circleA.previous;
        let forwardDistance = circleB._.r;
        let backwardDistance = circleA._.r;

        do {
            if (forwardDistance <= backwardDistance) {
                if (intersects(forwardNode._, circleC._)) {
                    circleB = forwardNode;
                    circleA.next = circleB;
                    circleB.previous = circleA;
                    --index;
                    continue packLoop;
                }
                forwardDistance += forwardNode._.r;
                forwardNode = forwardNode.next;
            } else {
                if (intersects(backwardNode._, circleC._)) {
                    circleA = backwardNode;
                    circleA.next = circleB;
                    circleB.previous = circleA;
                    --index;
                    continue packLoop;
                }
                backwardDistance += backwardNode._.r;
                backwardNode = backwardNode.previous;
            }
        } while (forwardNode !== backwardNode.next);

        circleC.previous = circleA;
        circleC.next = circleB;
        circleA.next = circleB.previous = circleB = circleC;

        let bestNode = circleA;
        let bestScore = score(circleA, width, height);
        let currentNode = circleA.next;

        while (currentNode !== circleB) {
            const currentScore = score(currentNode, width, height);
            if (currentScore < bestScore) {
                bestNode = currentNode;
                bestScore = currentScore;
            }
            currentNode = currentNode.next;
        }

        circleA = bestNode;
        circleB = circleA.next;
    }

    centerLargestCircles(circles, width, height);
    relocateSmallCirclesIntoGaps(circles, width, height);

    return circles;
}

export function place(circleB, circleA, circleC) {
    const deltaX = circleB.x - circleA.x;
    const deltaY = circleB.y - circleA.y;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;

    if (distanceSquared) {
        const distanceToA = (circleA.r + circleC.r) ** 2;
        const distanceToB = (circleB.r + circleC.r) ** 2;

        if (distanceToA > distanceToB) {
            const projection =
                (distanceSquared + distanceToB - distanceToA) /
                (2 * distanceSquared);
            const height = Math.sqrt(
                Math.max(
                    0,
                    distanceToB / distanceSquared - projection * projection,
                ),
            );

            circleC.x = circleB.x - projection * deltaX - height * deltaY;
            circleC.y = circleB.y - projection * deltaY + height * deltaX;
        } else {
            const projection =
                (distanceSquared + distanceToA - distanceToB) /
                (2 * distanceSquared);
            const height = Math.sqrt(
                Math.max(
                    0,
                    distanceToA / distanceSquared - projection * projection,
                ),
            );

            circleC.x = circleA.x + projection * deltaX - height * deltaY;
            circleC.y = circleA.y + projection * deltaY + height * deltaX;
        }
    } else {
        circleC.x = circleA.x + circleC.r;
        circleC.y = circleA.y;
    }
}

export function intersects(circleA, circleB) {
    const combinedRadius = circleA.r + circleB.r - 1e-6;
    const deltaX = circleB.x - circleA.x;
    const deltaY = circleB.y - circleA.y;

    return (
        combinedRadius > 0 &&
        combinedRadius * combinedRadius > deltaX * deltaX + deltaY * deltaY
    );
}

function centerLargestCircles(circles, width, height) {
    if (circles.length < 4) {
        return;
    }

    const largestRadius = circles[0].r;
    const largeCircleLimit = circles.findIndex(
        (circle) => circle.r < largestRadius * 0.6,
    );
    const largeCircleCount =
        largeCircleLimit === -1
            ? Math.min(circles.length, 12)
            : largeCircleLimit;

    const largeCircles = circles.slice(0, Math.max(3, largeCircleCount));

    for (let iteration = 0; iteration < 80; iteration += 1) {
        let moved = false;

        for (let index = 0; index < largeCircles.length; index += 1) {
            const circle = largeCircles[index];
            const pullStrength =
                0.06 * (1 - index / Math.max(1, largeCircles.length));
            const nextX = circle.x * (1 - pullStrength);
            const nextY = circle.y * (1 - pullStrength);

            if (canMoveCircle(circle, nextX, nextY, circles, index)) {
                circle.x = nextX;
                circle.y = nextY;
                moved = true;
            }
        }

        resolveOverlaps(largeCircles);
        if (!moved) {
            break;
        }
    }

    const offsetX =
        largeCircles.reduce((sum, circle) => sum + circle.x, 0) /
        largeCircles.length;
    const offsetY =
        largeCircles.reduce((sum, circle) => sum + circle.y, 0) /
        largeCircles.length;

    for (const circle of circles) {
        circle.x -= offsetX;
        circle.y -= offsetY;
    }
}

function canMoveCircle(circle, nextX, nextY, circles) {
    const originalX = circle.x;
    const originalY = circle.y;

    circle.x = nextX;
    circle.y = nextY;

    for (const otherCircle of circles) {
        if (otherCircle === circle) {
            continue;
        }
        if (intersects(circle, otherCircle)) {
            circle.x = originalX;
            circle.y = originalY;
            return false;
        }
    }

    circle.x = originalX;
    circle.y = originalY;
    return true;
}

function resolveOverlaps(circles) {
    for (let iteration = 0; iteration < 6; iteration += 1) {
        let adjusted = false;

        for (
            let firstIndex = 0;
            firstIndex < circles.length - 1;
            firstIndex += 1
        ) {
            for (
                let secondIndex = firstIndex + 1;
                secondIndex < circles.length;
                secondIndex += 1
            ) {
                const firstCircle = circles[firstIndex];
                const secondCircle = circles[secondIndex];

                const deltaX = secondCircle.x - firstCircle.x;
                const deltaY = secondCircle.y - firstCircle.y;
                const distance =
                    Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1e-6;
                const minimumDistance = firstCircle.r + secondCircle.r;

                if (distance < minimumDistance) {
                    const overlap = (minimumDistance - distance) / 2;
                    const unitX = deltaX / distance;
                    const unitY = deltaY / distance;

                    firstCircle.x -= unitX * overlap;
                    firstCircle.y -= unitY * overlap;
                    secondCircle.x += unitX * overlap;
                    secondCircle.y += unitY * overlap;
                    adjusted = true;
                }
            }
        }

        if (!adjusted) {
            break;
        }
    }
}

function relocateSmallCirclesIntoGaps(circles, width, height) {
    if (circles.length < 6) {
        return;
    }

    const largestRadius = circles[0].r;
    const smallCircleStartIndex = circles.findIndex(
        (circle) => circle.r <= largestRadius * 0.45,
    );

    if (smallCircleStartIndex === -1) {
        return;
    }

    for (
        let circleIndex = smallCircleStartIndex;
        circleIndex < circles.length;
        circleIndex += 1
    ) {
        const circle = circles[circleIndex];
        const placedCircles = circles.slice(0, circleIndex);

        const bestCandidate = findBestGapPlacement(
            circle,
            placedCircles,
            width,
            height,
        );

        if (bestCandidate) {
            circle.x = bestCandidate.x;
            circle.y = bestCandidate.y;
        }
    }
}

function findBestGapPlacement(circle, placedCircles, width, height) {
    if (placedCircles.length < 2) {
        return null;
    }

    let bestCandidate = null;
    let bestScore = +Infinity;

    for (
        let firstIndex = 0;
        firstIndex < placedCircles.length - 1;
        firstIndex += 1
    ) {
        for (
            let secondIndex = firstIndex + 1;
            secondIndex < placedCircles.length;
            secondIndex += 1
        ) {
            const firstCircle = placedCircles[firstIndex];
            const secondCircle = placedCircles[secondIndex];

            const candidates = getTangentPositions(
                firstCircle,
                secondCircle,
                circle.r,
            );

            for (const candidate of candidates) {
                if (!candidate) {
                    continue;
                }

                const positionedCircle = {
                    ...circle,
                    x: candidate.x,
                    y: candidate.y,
                };

                if (!isValidGapCandidate(positionedCircle, placedCircles)) {
                    continue;
                }

                const candidateScore = scoreGapCandidate(
                    positionedCircle,
                    placedCircles,
                    width,
                    height,
                );

                if (candidateScore < bestScore) {
                    bestScore = candidateScore;
                    bestCandidate = candidate;
                }
            }
        }
    }

    return bestCandidate;
}

function getTangentPositions(firstCircle, secondCircle, radius) {
    const expandedRadiusA = firstCircle.r + radius;
    const expandedRadiusB = secondCircle.r + radius;

    const deltaX = secondCircle.x - firstCircle.x;
    const deltaY = secondCircle.y - firstCircle.y;
    const centerDistanceSquared = deltaX * deltaX + deltaY * deltaY;
    const centerDistance = Math.sqrt(centerDistanceSquared);

    if (!centerDistance) {
        return [];
    }

    if (centerDistance > expandedRadiusA + expandedRadiusB) {
        return [];
    }

    if (centerDistance < Math.abs(expandedRadiusA - expandedRadiusB)) {
        return [];
    }

    const projection =
        (expandedRadiusA * expandedRadiusA -
            expandedRadiusB * expandedRadiusB +
            centerDistanceSquared) /
        (2 * centerDistance);

    const heightSquared =
        expandedRadiusA * expandedRadiusA - projection * projection;

    if (heightSquared < 0) {
        return [];
    }

    const tangentHeight = Math.sqrt(heightSquared);
    const unitX = deltaX / centerDistance;
    const unitY = deltaY / centerDistance;

    const baseX = firstCircle.x + projection * unitX;
    const baseY = firstCircle.y + projection * unitY;

    const offsetX = -unitY * tangentHeight;
    const offsetY = unitX * tangentHeight;

    return [
        { x: baseX + offsetX, y: baseY + offsetY },
        { x: baseX - offsetX, y: baseY - offsetY },
    ];
}

function isValidGapCandidate(candidateCircle, placedCircles) {
    for (const placedCircle of placedCircles) {
        if (intersects(placedCircle, candidateCircle)) {
            return false;
        }
    }

    return true;
}

function scoreGapCandidate(candidateCircle, placedCircles, width, height) {
    const normalizedCenterX = candidateCircle.x / Math.max(1, width);
    const normalizedCenterY = candidateCircle.y / Math.max(1, height);
    const centerDistancePenalty =
        normalizedCenterX * normalizedCenterX +
        normalizedCenterY * normalizedCenterY;

    const clearances = [];

    for (const placedCircle of placedCircles) {
        const deltaX = candidateCircle.x - placedCircle.x;
        const deltaY = candidateCircle.y - placedCircle.y;
        const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const clearance = centerDistance - (candidateCircle.r + placedCircle.r);
        clearances.push(clearance);
    }

    clearances.sort((left, right) => left - right);

    const firstClearance = clearances[0] ?? 0;
    const secondClearance = clearances[1] ?? firstClearance;
    const thirdClearance = clearances[2] ?? secondClearance;

    return (
        firstClearance * 8 +
        secondClearance * 4 +
        thirdClearance * 2 +
        centerDistancePenalty * candidateCircle.r * 12
    );
}

export class Node {
    constructor(circle) {
        this._ = circle;
        this.next = null;
        this.previous = null;
    }
}

const packCircles = {
    pack,
    bounds,
};

export default packCircles;
