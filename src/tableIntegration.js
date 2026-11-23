import { computed, watch } from 'vue';

export function useChartTable({
    tableUnit,
    userOptions,
    waitForTableMount = false,
    ...options
}) {
    const { config, mutableConfig, showTable } = options;
    const tableComponent = computed(() => getTableComponent(options));
    const isVisible = () => mutableConfig.value.showTable;

    // Lazy tables mount their dialog in response to the visibility change.
    watch(
        waitForTableMount ? [isVisible, tableUnit] : [isVisible],
        ([visible]) =>
            syncTableVisibility(visible, config, tableUnit, showTable),
        { flush: waitForTableMount ? 'post' : 'pre' },
    );

    function toggleTable() {
        mutableConfig.value.showTable = !isVisible();
    }

    function closeTable() {
        mutableConfig.value.showTable = false;
        userOptions.value?.setTableIconState(false);
    }

    return { tableComponent, toggleTable, closeTable };
}

export function getTableComponent({
    config,
    style,
    titleStyle = style,
    mutableConfig,
    dialog,
    accordion,
    isFullscreen,
    parent,
    maxWidth,
    isCursorPointer,
    showTable,
}) {
    const useDialog =
        config.value.table.useDialog &&
        !(showTable ? showTable() : config.value.table.show);
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? dialog : accordion,
        title: `${titleStyle.value.title.text}${titleStyle.value.title.subtitle.text ? `: ${titleStyle.value.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: config.value.table.th.backgroundColor,
                  color: config.value.table.th.color,
                  headerColor: config.value.table.th.color,
                  headerBg: config.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: parent.value,
                  forcedWidth: Math.min(maxWidth, window.innerWidth * 0.8),
                  ...(isCursorPointer
                      ? { isCursorPointer: isCursorPointer.value }
                      : {}),
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor: style.value.backgroundColor,
                          color: style.value.color,
                      },
                      head: {
                          backgroundColor: style.value.backgroundColor,
                          color: style.value.color,
                      },
                  },
              },
    };
}

export function syncTableVisibility(visible, config, tableUnit, showTable) {
    if (showTable ? showTable() : config.value.table.show) return;
    const table = tableUnit.value;
    if (visible && config.value.table.useDialog) {
        table?.open?.();
    } else {
        table?.close?.();
    }
}
