const EventEmitter = require('events');
const path = require('path');
const semver = require('semver');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { AsyncHookPlugin, BuildHookPlugin, transformManifest } = require('./scripts/webpack');
const { babelLoaderRule, baseConfig, libraryEntries, libraryName, srcPath } = require('./webpack-common.config');

const eventEmitter = new EventEmitter();
const version = require('./package.json').version;
const versionDir = `v${semver.major(version)}`;
const outputPath = path.join(__dirname, 'dist-server', versionDir);

function getServerConfig() {
    return {
        ...baseConfig,
        entry: libraryEntries,
        output: {
            filename: '[name]-[contenthash:8].js',
            library: libraryName,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [
                babelLoaderRule,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            new WebpackAssetsManifest({
                entrypoints: true,
                output: path.join(outputPath, 'manifest.json'),
                publicPath: path.join(process.env.ASSET_HOST || '__ASSET_HOST__', versionDir, '/'),
                transform: assets => transformManifest(assets, version),
            }),
            new BuildHookPlugin({
                onDone() {
                    eventEmitter.emit('library:done');
                },
            }),
        ],
    };
}

function getServerLoaderConfig() {
    return {
        ...baseConfig,
        entry: {
            loader: path.join(srcPath, 'loader.ts'),
        },
        output: {
            filename: '[name].js',
            library: `${libraryName}Loader`,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [
                babelLoaderRule,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            new AsyncHookPlugin({
                onRun({ compiler, done }) {
                    eventEmitter.on('library:done', () => {
                        const definePlugin = new DefinePlugin({
                            MANIFEST_JSON: JSON.stringify(require(path.join(outputPath, 'manifest.json'))),
                        });

                        definePlugin.apply(compiler);
                        eventEmitter.emit('loader:done');
                        done();
                    });
                },
            }),
            new DefinePlugin({
                LIBRARY_NAME: JSON.stringify(libraryName),
            }),
        ],
    };
}

// This configuration is for building distribution files for the static server
// instead of the NPM package.
function getConfigs(options, argv) {
    return [
        getServerConfig(options, argv),
        getServerLoaderConfig(options, argv),
    ];
}

module.exports = getConfigs;
