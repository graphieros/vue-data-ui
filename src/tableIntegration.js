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

// Preserve the existing synchronous watcher behavior, including its close guard.
export function syncTableVisibility(visible, config, tableUnit) {
    if (config.value.table.show) return;
    if (visible && config.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open();
    } else if ('close' in tableUnit.value) {
        tableUnit.value.close();
    }
}
