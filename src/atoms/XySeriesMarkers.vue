<script setup>
import Shape from './Shape.vue';

const props = defineProps({
    type: String,
    serie: Object,
    serieIndex: Number,
    selectedScale: String,
    comments: Object,
    getItems: Function,
    getPlotStyle: Function,
    showMarker: Function,
    getShapeProps: Function,
    getMemo: Function,
});
</script>

<template>
    <g
        :class="type === 'plot' ? `serie_plot_${serieIndex}` : undefined"
        :style="`opacity:${selectedScale ? (selectedScale === serie.groupId ? 1 : 0.2) : 1};transition:opacity 0.2s ease-in-out`"
    >
        <g
            v-for="{ plot, index: j } in getItems(serie)"
            v-memo="getMemo(type, serie, plot, serieIndex, j)"
            :key="`circle_${type}_${serie.id}_${j}`"
            :data-cy="type === 'plot' ? 'datapoint-plot' : undefined"
            :class="type === 'line' ? 'vue-ui-xy-line-marker' : undefined"
            :style="getPlotStyle(plot)"
        >
            <Shape
                v-if="showMarker(type, serie, plot, j)"
                v-bind="getShapeProps(type, serie, plot, serieIndex, j)"
            />
            <foreignObject
                v-if="plot.comment && comments.show"
                style="overflow: visible"
                height="12"
                :width="comments.width"
                :x="plot.x - comments.width / 2 + comments.offsetX"
                :y="plot.y + comments.offsetY + 6"
            >
                <div style="width: 100%">
                    <slot
                        name="plot-comment"
                        :plot="{
                            ...plot,
                            color: serie.color,
                            seriesIndex: serieIndex,
                            datapointIndex: j,
                        }"
                    />
                </div>
            </foreignObject>
        </g>
    </g>
</template>
