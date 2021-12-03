import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

module.exports = (
    env: unknown,
    argv: Record<string, string>
): Configuration => {
    const IS_DEV = argv.mode == 'development'

    return {
        target: 'web',
        devtool: IS_DEV ? 'inline-source-map' : 'none',

        entry: path.join(__dirname, 'src/app.ts'),
        output: {
            filename: 'bundle.js',
            path: path.join(__dirname, 'www'),
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: {
                        loader: 'ts-loader',
                    },
                },
            ],
        },

        resolve: {
            modules: [path.resolve('node_modules'), path.resolve('src')],
            extensions: ['.ts', '.js'],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html',
            }),
        ],
    }
}
