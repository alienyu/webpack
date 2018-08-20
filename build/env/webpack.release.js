let path = require('path');
let webpack = require('webpack');
let env = process.env.NODE_ENV;
let merge = require("webpack-merge");
let releaseConf = require("../config/releaseConfig.json");
let projectName = releaseConf.projectName;
let HtmlWebpackPlugin = require('html-webpack-plugin');
let projectConf = require(`${process.cwd()}/biz/webpackConfig.project.js`)(releaseConf);
console.log("this is release")

let envConf = merge(projectConf, {
    output: {
        path: `${process.cwd()}/${projectName}-output/`, //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
        publicPath: '../../'               //模板、样式、脚本、图片等资源对应的server上的路径
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        })
    ],
    devtool: env == "local" ? "source-map" : ""
});

function runtime(conf) {
    let platform = conf.platform;
    let page = conf.page; //带路径的页面名称(pagePathA/pagePathB/pageName)
    let pageArr = page.split("/"); //["pagePathA", "pagePathB", "pageName"]
    let htmlName = pageArr.pop(); //实际单页文件入口html(pageName)
    let pagePath = pageArr.length > 0 ? pageArr.join("/") : ""; //页面路径(pagePathA/pagePathB)
    var entryID = `${platform}/${pagePath}${htmlName}/${htmlName}`; // platform/pagePath/pageName
    var fileRoute = `${process.cwd()}/biz/${platform}/page/${pagePath}${htmlName}`; //biz/platform/page/pagePath/pageName
    envConf.entry[entryID] = `${fileRoute}/${htmlName}.js`; 
    //biz/platform/page/pagePath/pageName.js
    envConf.plugins.push(new HtmlWebpackPlugin({
        //根据模板插入css/js等生成最终HTML
        filename: entryID + ".html",
        //生成的html存放路径，相对于path
        template: `${fileRoute}/${htmlName}.html`,
        favicon: `${process.cwd()}/biz/common/static/imgs/favicon.png`,
        //js插入的位置，true/'head'/'body'/false
        inject: 'body',
        hash: true, //为静态资源生成hash值
        chunks: [`common/${projectName}-vendor`, entryID], //需要引入的chunk，不配置就会引入所有页面的资源
        minify: {
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        }
    }));
}

function loadConfig() {
    module.exports.entry = {};
    //解析需要构建的页面
    let deployContent = releaseConf.deployContent;
    let platformList = Object.keys(deployContent);
    platformList.map(platform => {
        let pageList = deployContent[platform].length > 0 ? deployContent[platform] : require(`${process.cwd()}/biz/${platform}/pageList.json`);
        pageList.map(page => {
            runtime({
                platform,
                page
            })
        })
    })
}

loadConfig();

module.exports = envConf;