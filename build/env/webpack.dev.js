let path = require('path');
let webpack = require('webpack');
let merge = require("webpack-merge");
let devConf = require("../config/devConfig.json");
let projectName = devConf.projectName;
let HtmlWebpackPlugin = require('html-webpack-plugin');
let projectConf = require(`${process.cwd()}/project/webpackConfig.project.js`)(devConf);
console.log("this is dev")

let envConf = merge(projectConf, {
    output: {
        path: process.cwd(), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
        publicPath: "/" //模板、样式、脚本、图片等资源对应的server上的路径
    },
    devtool: "source-map",
    //使用webpack-dev-server，提高开发效率
    devServer: {
        contentBase: './',
        host: "localhost",
        port: 6060, //默认8080
        inline: true, //可以监控js变化```
        hot: true //热启动
    }
});

function runtime(conf) {
    let platform = conf.platform;
    let page = conf.page; //带路径的页面名称(pagePathA/pagePathB/pageName)
    let pageArr = page.split("/"); //["pagePathA", "pagePathB", "pageName"]
    let htmlName = pageArr.pop(); //实际单页文件入口html(pageName)
    let pagePath = pageArr.length > 0 ? pageArr.join("/") : ""; //页面路径(pagePathA/pagePathB)
    var entryID = `${platform}/${pagePath}${htmlName}/${htmlName}`; // projectName/platform/pagePath/pageName
    var fileRoute = `${process.cwd()}/project/${platform}/page/${pagePath}${htmlName}`; //biz/platform/page/pagePath/pageName
    envConf.entry[entryID] = `${fileRoute}/${htmlName}.js`; 
    //biz/platform/page/pagePath/pageName.js
    envConf.plugins.push(new HtmlWebpackPlugin({
        //根据模板插入css/js等生成最终HTML
        filename: entryID + ".html",
        //生成的html存放路径，相对于path
        template: `${fileRoute}/${htmlName}.html`,
        favicon: `${process.cwd()}/project/common/static/imgs/favicon.png`,
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
    let deployContent = devConf.deployContent;
    let platformList = Object.keys(deployContent);
    platformList.map(platform => {
        let pageList = deployContent[platform].length > 0 ? deployContent[platform] : require(`${process.cwd()}/project/${platform}/pageList.json`);
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