var webpack = require("webpack")

module.exports = {
    devtool: false,
    entry: {
        backend: "./shells/chrome/src/backend.js",
        background: "./shells/chrome/src/background.js",
        injectGlobalHook: "./shells/chrome/src/injectGlobalHook.js",
        contentScript: "./shells/chrome/src/contentScript.js",
        panel: "./shells/chrome/src/panel",
        "panel-loader": "./shells/chrome/src/panel-loader.js",
        window: "./shells/chrome/src/window"
    },
    output: {
        path: __dirname + "/shells/chrome/build",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: ["es2015", "stage-1"],
                    plugins: ["transform-decorators-legacy", "transform-class-properties"]
                }
            },
            // {
            //     test: /\.jsx?$/,
            //     exclude: /node_modules/,
            //     loader: "eslint-loader",
            //     query: {
            //         failOnWarning: false,
            //         failOnError: process.env.NODE_ENV !== "development",
            //         fix: process.env.NODE_ENV === "development",
            //         cache: false
            //     }
            // },
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.svg$/,
                loader: "url-loader"
            },
            {
                test: /\.css$/,
                loader: "style-loader!style-loader"
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts"],
        alias: {
            "mobx-react": __dirname + "/mobx-react/src",
            mobx: __dirname + "/mobx/src/mobx.ts"
        }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __DEBUG_CONNECTION__: JSON.stringify(process.env['DEBUG_CONNECTION'] === 'true'),
        __TARGET__: JSON.stringify("browser")
      }),
    ]
}
