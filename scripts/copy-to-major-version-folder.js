#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { major } = require('semver');
const { version } = require('../package.json');

const distPath = join(__dirname, '..', 'dist-server');
const majorVersionDir = `v${major(version)}`;
const versionDir = `v${version}`;

execSync(`rm -rf ${join(distPath, majorVersionDir)}`);
execSync(`cp -r ${join(distPath, versionDir)} ${join(distPath, majorVersionDir)}`);

const manifest = JSON.parse(readFileSync(join(distPath, versionDir, 'manifest.json')));
const newManifest = Object.assign({}, manifest, {
    js: manifest.js.map(path => path.replace(`/${versionDir}/`, `/${majorVersionDir}/`)),
});

writeFileSync(join(distPath, majorVersionDir, 'manifest.json'), JSON.stringify(newManifest));
