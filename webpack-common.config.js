const path = require('path');
const { DefinePlugin } = require('webpack');
const { exec } = require('child_process');

const { BuildHookPlugin, getNextVersion } = require('./scripts/webpack');
const { promisify } = require('util');

const srcPath = path.join(__dirname, 'packages/core/src');

const libraryName = 'checkoutKit';

const libraryEntries = {
    'checkout-sdk': path.join(srcPath, 'bundles', 'checkout-sdk.ts'),
    'checkout-button': path.join(srcPath, 'bundles', 'checkout-button.ts'),
    'embedded-checkout': path.join(srcPath, 'bundles', 'embedded-checkout.ts'),
    'hosted-form': path.join(srcPath, 'bundles', 'hosted-form.ts'),
    'internal-mappers': path.join(srcPath, 'bundles', 'internal-mappers.ts'),
};

async function getBaseConfig() {
    return {
        stats: {
            errorDetails: true,
            logging: 'verbose'
        },
        devtool: 'source-map',
        mode: 'production',
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@bigcommerce/checkout-sdk/apple-pay': path.resolve(__dirname, '/packages/apple-pay/src'),
                '@bigcommerce/checkout-sdk/test-utils': path.resolve(__dirname, '/packages/test-utils/src'),
            }
        },
        module: {
            rules: [
                {
                    parser: {
                        amd: false,
                    },
                },
                {
                    test: /\.[tj]s$/,
                    enforce: 'pre',
                    loader: require.resolve('source-map-loader'),
                },
                {
                    test: /\.[tj]s$/,
                    include: srcPath,
                    loader: 'ts-loader',
                },
            ],
        },
        plugins: [
            new DefinePlugin({
                'LIBRARY_VERSION': JSON.stringify(await getNextVersion()),
            }),
            new BuildHookPlugin({
                async onBeforeCompile() {
                    const { stdout, stderr } = await promisify(exec)('npm run generate');

                    if (stderr) {
                        throw new Error(stderr);
                    }

                    console.log(stdout);
                },
            }),
        ],
    };
};

const babelEnvPreset = [
    '@babel/preset-env',
    {
        corejs: 3,
        targets: [
            'defaults',
            'ie 11',
        ],
        useBuiltIns: 'usage',
    },
];

const babelLoaderRules = [
    {
        test: /\.[tj]s$/,
        loader: 'babel-loader',
        include: srcPath,
        options: {
            presets: [
                babelEnvPreset,
            ],
        },
    },
    {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'node_modules'),
        exclude: [
            /\/node_modules\/core-js\//,
            /\/node_modules\/webpack\//,
        ],
        options: {
            presets: [
                babelEnvPreset,
            ],
            sourceType: 'unambiguous',
        }
    },
];

module.exports = {
    babelLoaderRules,
    getBaseConfig,
    libraryEntries,
    libraryName,
    srcPath,
};
