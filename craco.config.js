// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

module.exports = {
    webpack: {
        configure: {
            resolve: {
                mainFields: ['esnext', 'browser', 'module', 'main'],
            },
        },
    },
};
