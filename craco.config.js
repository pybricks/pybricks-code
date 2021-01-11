// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const {
    addBeforeLoader,
    getLoader,
    getLoaders,
    loaderByName,
} = require('@craco/craco');

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

                    // work around default handling of .wasm files
                    // https://github.com/webpack/webpack/issues/7352
                    addBeforeLoader(webpackConfig, loaderByName('file-loader'), {
                        test: /\.wasm$/,
                        type: 'javascript/auto',
                        loader: 'file-loader',
                        options: {
                            name: 'static/[name].[hash:8].[ext]',
                        },
                    });

                    return webpackConfig;
                },
            },
            options: {},
        },
    ],
};
