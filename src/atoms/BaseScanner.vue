<template>
    <div class="vue-data-ui-scanner"></div>
</template>

<style scoped>
.vue-data-ui-scanner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* pointer-events: none; */
}

.vue-data-ui-scanner::before {
    content: "";
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: linear-gradient(to right,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent);
    filter: blur(8px);
    animation: scan 2.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes scan {
    0% {
        left: -50%;
    }

    100% {
        left: 100%;
    }
}
</style>