<script setup lang="ts">
import { computed } from 'vue';
import { getVueDataUiConfig } from 'vue-data-ui';
import {
    VueUiRating,
    type VueUiRatingConfig,
    type VueUiRatingDataset,
} from 'vue-data-ui/vue-ui-rating';

const dataset = computed<VueUiRatingDataset>(() => {
    return {
        rating: {
            '1': 146,
            '2': 225,
            '3': 3920,
            '4': 1050,
            '5': 2125,
        },
    };
});

const config = computed<VueUiRatingConfig>(() => {
    return {
        type: 'star',
        readonly: false,
        from: 1,
        to: 5,
        useCursorPointer: false,
        style: {
            fontFamily: 'inherit',
            animated: true,
            itemSize: 64,
            backgroundColor: '#FFFFFF',
            star: {
                activeColor: '#FFD055',
                borderColor: '#FFD055',
                borderWidth: 3,
                apexes: 5,
                inactiveColor: '#e1e5e8',
                useGradient: true,
            },
            image: {
                src: '',
                inactiveOpacity: 0.3,
                alt: 'rating image',
            },
            title: {
                textAlign: 'center',
                fontSize: 20,
                color: '#2D353C',
                bold: true,
                text: '',
                offsetY: 6,
                subtitle: {
                    fontSize: 14,
                    color: '#CCCCCC',
                    bold: false,
                    text: '',
                    offsetY: 12,
                },
            },
            rating: {
                show: true,
                fontSize: 24,
                bold: true,
                roundingValue: 1,
                position: 'bottom',
                offsetY: 0,
                offsetX: 0,
                formatter: null,
            },
            tooltip: {
                show: true,
                fontSize: 14,
                offsetY: 0,
                color: '#2D353C',
                bold: true,
                backgroundColor: '#FFFFFF',
                borderColor: '#e1e5e8',
                borderRadius: 4,
                boxShadow: '0 6px 12px -6px rgba(0,0,0,0.2)',
                roundingValue: 0,
                formatter: null,
            },
        },
    };
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiRating :dataset :config>
            <template
                #layer-under="{ focusedValue, hoveredValue, size, value }"
            >
                <code style="color: chocolate; font-size: 6px"
                    >#layer-under</code
                >
            </template>
            <template
                #layer-above="{ focusedValue, hoveredValue, size, value }"
            >
                <div style="padding-top: 12px">
                    <code style="color: chocolate; font-size: 6px"
                        >#layer-above</code
                    >
                </div>
            </template>
        </VueUiRating>
    </div>
</template>
