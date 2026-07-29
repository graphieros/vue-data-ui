import { toValue, watchEffect } from 'vue';

export const COMMON_RULES = {
    noHint: {
        test: () => true,
        message: [
            'There is no advice available for this component at the moment 🏖️',
        ],
    },

    emptyArray: {
        test: (dataset) => dataset.length === 0,
        message: [
            '👀 The dataset is empty.',
            '',
            '▶️ Check the documentation or the dataset TS type to see how to populate the dataset for this component.',
        ],
    },

    singleSeries: {
        test: (dataset) => dataset.length === 1,
        message: [
            '👀 The dataset only has a single series. Consider:',
            '',
            '▶️ Using a value display instead of a chart component, or using VueUiKpi.',
        ],
    },
};

export function useHints({ config, dataset, component, rules }) {
    if (!rules || rules?.length === 0) {
        return;
    }

    let previousMessage;

    watchEffect(() => {
        const resolvedConfig = toValue(config) ?? {};

        if (!resolvedConfig.devHints?.enable) {
            previousMessage = undefined;
            return;
        }

        const resolvedDataset = toValue(dataset);

        if (!resolvedDataset) {
            previousMessage = [
                '',
                component,
                '💬 Vue Data UI advice:',
                '---------------------',
                '',
                `❌ Invalid dataset`,
                '',
                '---------------------',
                'Turn off advice by setting config.devHints.enable: false',
            ].join('\n');

            console.warn(previousMessage);
            return;
        }

        const triggeredMessages = rules
            .filter((rule) => rule.test(resolvedDataset))
            .map((rule) => rule.message.join('\n'));

        const message = triggeredMessages.length
            ? triggeredMessages.join('\n\n')
            : '✅ Your dataset is appropriate';

        if (message === previousMessage) {
            return;
        }

        previousMessage = message;

        const mutedConsoleStyle = ['color: #888', 'font-weight: normal'].join(
            ';',
        );

        console.info(
            [
                '',
                `💬 ${component}`,
                '%cVue Data UI advice:%c',
                '%c-------------------%c',
                '',
                message,
                '',
                '%c-------------------',
                "Turn off advice by setting devHints.enable: false in the component's config%c",
            ].join('\n'),
            mutedConsoleStyle,
            '',
            mutedConsoleStyle,
            '',
            mutedConsoleStyle,
            '',
        );
    });
}
