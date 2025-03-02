#!/usr/bin/env node

// XXX: This mimics (simplified) webpack behavior, but makes sure that we are
// always resolving webpack-cli relative to the config. It is required to do, to
// avoid hoisting issues that can try to start e.g., webpack-dev-server with
// an unsupported version due to some webpack deps being hoisted and some not
// (also allows other packages to avoid depending on those)
//
// This can be removed immediately after we are done moving other plugins to the
// new webpack configuration.
const path = require('path');
process.env.WEBPACK_CLI_SKIP_IMPORT_LOCAL = true;
// TODO: This doesn't work until https://github.com/webpack/webpack-cli/pull/2907 is published
// process.env.WEBPACK_PACKAGE = path.dirname(
//   require.resolve('webpack/package.json')
// );
// process.env.WEBPACK_DEV_SERVER_PACKAGE = path.dirname(
//   require.resolve('webpack-dev-server/package.json')
// );
const pkgPath = require.resolve(`webpack-cli/package.json`);
const pkg = require(pkgPath);
require(path.resolve(path.dirname(pkgPath), pkg.bin['webpack-cli']));
