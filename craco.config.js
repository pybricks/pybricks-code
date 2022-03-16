// Configuration file to override create-react-app.
//
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const { addBeforeLoader, loaderByName } = require('@craco/craco');
const CopyPlugin = require('copy-webpack-plugin');
const LicensePlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const satisfies = require('spdx-satisfies');
const path = require('path');

// Permissive licenses can be added here. We would like to avoid copyleft.
const approvedLicenses = ['0BSD', 'Apache-2.0', 'BSD-3-Clause', 'ISC', 'MIT'];

/** Converts a package.json "person" to a string.
 *
 * Ref: https://docs.npmjs.com/cli/v6/configuring-npm/package-json#people-fields-author-contributors
 *
 * @param person a string or "person" object or undefined
 * @returns A string or undefined.
 */
function personToString(person) {
    if (typeof person === 'string' || typeof person === 'undefined') {
        return person;
    }

    let str = person.name;
    if (person.email) {
        str += ` <${person.email}>`;
    }
    if (person.url) {
        str += ` (${person.url})`;
    }
    return str;
}

// Some packages don't have a separate license file, so we have to copy the
// license here e.g. from the README.

function fedorIndutnyLicense(year) {
    return `This software is licensed under the MIT License.

Copyright Fedor Indutny, ${year}.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.`;
}

const shopifyLicense = `MIT License

Copyright (c) 2021 Shopify

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const licenseTextOverrides = {
    '@shopify/dates': shopifyLicense,
    '@shopify/decorators': shopifyLicense,
    '@shopify/function-enhancers': shopifyLicense,
    '@shopify/i18n': shopifyLicense,
    '@shopify/react': shopifyLicense,
    '@shopify/react-hooks': shopifyLicense,
    '@shopify/react-i18n': shopifyLicense,
    'bn.js': fedorIndutnyLicense(2015),
    brorand: fedorIndutnyLicense(2014),
    'des.js': fedorIndutnyLicense(2015),
    elliptic: fedorIndutnyLicense(2014),
    'hash.js': fedorIndutnyLicense(2014),
    'hmac-drbg': fedorIndutnyLicense(2017),
    'miller-rabin': fedorIndutnyLicense(2014),
    'minimalistic-crypto-utils': fedorIndutnyLicense(2017),
    gud: `MIT License

Copyright (c)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    isarray: `(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    'popper.js': `The MIT License (MIT)

Copyright (c) 2019 Federico Zivolo

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
    'zen-push': `Copyright (c) 2018 zenparsing (Kevin Smith)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
};

module.exports = {
    webpack: {
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: 'public/manifest.json',
                        transform(content, path) {
                            return content
                                .toString()
                                .replace(
                                    /%\w+%/g,
                                    (m) => process.env[m.slice(1, m.length - 1)] || '',
                                );
                        },
                    },
                ],
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'node_modules/@pybricks/ide-docs/html',
                        to: 'static/docs',
                    },
                ],
            }),
            new LicensePlugin({
                outputFilename: 'static/oss-licenses.json',
                perChunkOutput: false,
                renderLicenses: (modules) => {
                    return JSON.stringify(
                        modules
                            .map((m) => ({
                                name: m.packageJson.name,
                                version: m.packageJson.version,
                                author: personToString(m.packageJson.author),
                                license: m.licenseId,
                                licenseText: m.licenseText,
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name, 'en')),
                    );
                },
                licenseTextOverrides,
                additionalModules: [
                    { name: '@pybricks/pybricks-code', directory: __dirname },
                    {
                        name: '@pybricks/ide-docs',
                        directory: path.join(
                            __dirname,
                            'node_modules',
                            '@pybricks',
                            'ide-docs',
                        ),
                    },
                ],
                unacceptableLicenseTest: (licenseType) =>
                    !satisfies(licenseType, `(${approvedLicenses.join(' OR ')})`),
            }),
            new MonacoWebpackPlugin({
                languages: ['python'],
                filename: '[name].worker.[contenthash].js',
            }),
        ],
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
                    // work around @shopify/* webpack compatibility
                    // https://github.com/Shopify/quilt/issues/1722#issuecomment-789883471
                    webpackConfig.module.rules.push({
                        test: /\.mjs$/,
                        include: /node_modules/,
                        type: 'javascript/auto',
                    });

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
                overrideJestConfig: ({
                    jestConfig,
                    cracoConfig,
                    pluginOptions,
                    context: { env, paths, resolve, rootDir },
                }) => {
                    const index = jestConfig.transformIgnorePatterns.indexOf(
                        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
                    );
                    // https://github.com/react-monaco-editor/react-monaco-editor/issues/306#issuecomment-701025628
                    // https://github.com/GoogleChromeLabs/browser-fs-access/issues/42
                    jestConfig.transformIgnorePatterns[index] =
                        '[/\\\\]node_modules[/\\\\](?!(monaco-editor|react-monaco-editor|browser-fs-access)[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$';
                    return jestConfig;
                },
            },
            options: {},
        },
    ],
};
