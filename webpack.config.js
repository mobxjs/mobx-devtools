var webpack = require("webpack")

module.exports = {
    entry: "./src/index.js",
    output: {
        libraryTarget: "umd",
        library: "mobxDevtools",
        path: __dirname,
        filename: "index.js"
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            // {
            //     test: /\.jsx?$/,
            //     exclude: /node_modules/,
            //     loader: "eslint-loader",
            //     options: {
            //         failOnWarning: false,
            //         failOnError: process.env.NODE_ENV !== "development",
            //         fix: true,
            //         cache: false
            //     }
            // },
            {
                test: /\.css$/,
                loader: "style-loader"
            },
            {
                test: /\.css$/,
                loader: "css-loader/locals",
                options: {
                    modules: true
                }
            },
            {
                test: /\.svg$/,
                loader: "url-loader"
            }
        ]
    },
    externals: {
        "mobx-react": {
            root: "mobxReact",
            commonjs: "mobx-react",
            commonjs2: "mobx-react",
            amd: "mobx-react"
        },
        react: {
            root: "React",
            commonjs: "react",
            commonjs2: "react",
            amd: "react"
        },
        mobx: "mobx"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            screw_ie8: true,
            compress: {
                warnings: false
            }
        })
    ]
}
