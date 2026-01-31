const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
    return {
        ...options,
        externals: [
            nodeExternals({
                // Allow bundling non-commonjs modules
                allowlist: ['webpack/hot/poll?100'],
            }),
        ],
        output: {
            ...options.output,
            libraryTarget: 'commonjs2',
        },
    };
};
