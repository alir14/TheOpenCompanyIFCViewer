const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    experiments: { asyncWebAssembly: true },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.wasm$/,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        modules: [__dirname, "node_modules"],
        extensions: ['.tsx', '.ts', '.js', 'jsx', '.wasm']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
    }
};
