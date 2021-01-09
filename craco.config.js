// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const { getLoader, getLoaders, loaderByName } = require('@craco/craco');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                // need 'esnext' first to avoid compile errors
                mainFields: ['esnext', 'browser', 'module', 'main'],
            },
        },
    },
    plugins: [
        {
            plugin: {
                overrideWebpackConfig: ({
                    webpackConfig,
                    cracoConfig,
                    pluginOptions,
                    context: { env, paths },
                }) => {
                    // add .esnext file extension for @shopify/*

                    webpackConfig.resolve.extensions = [
                        '.web.esnext',
                        '.esnext',
                        ...webpackConfig.resolve.extensions,
                    ];

                    const babelLoaders = getLoaders(
                        webpackConfig,
                        loaderByName('babel-loader'),
                    );
                    babelLoaders.matches[0].loader.test = /\.(esnext|js|mjs|jsx|ts|tsx)$/;
                    babelLoaders.matches[1].loader.test = /\.(esnext|js|mjs)$/;

                    const fileLoader = getLoader(
                        webpackConfig,
                        loaderByName('file-loader'),
                    );
                    fileLoader.match.loader.exclude = [
                        /\.(esnext|js|mjs|jsx|ts|tsx)$/,
                        /\.html$/,
                        /\.json$/,
                    ];

                    return webpackConfig;
                },
            },
            options: {},
        },
    ],
};
