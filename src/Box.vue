<template>
    <div style="width: 100%;margin-top:12px;">
        <details>
            <summary style="user-select:none;cursor:pointer;height:30px;background:#e1e5e8;line-height:24px;font-size:24px;padding:12px;">
                <slot name="title"></slot>
            </summary>
            <div style="display: flex;flex-direction:row; gap:12px; align-items:center;justify-content:center;background:#e1e5e8;padding:12px">
                <div style="width:100%;padding:12px;">
                    <div style="width:100%;text-align:center">DEV</div>
                    <slot name="dev"></slot>
                </div>
                <div style="width:100%;padding:12px">
                    <div style="width:100%;text-align:center">PRODUCTION</div>
                    <slot name="prod"></slot>
                </div>
            </div>
        </details>
    </div>
</template>