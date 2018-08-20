function loadPlatformConf(envConf) {
    let webpack = require('webpack');
    let merge = require("webpack-merge");
    let platformConf = {};
    //获取待编译的页面列表
    let pageList = envConf['deployContent']['web'].length > 0 ? envConf['deployContent']['web'] : require(`./pageList.json`);
    let pageConf = {};
    pageList.map(pageName => {
        pageConf = merge(pageConf, require(`./page/${pageName}/webpack.page.js`));
    })
    platformConf = merge({
    }, pageConf);
    console.log("this is platform")
    return platformConf;
}

module.exports = loadPlatformConf;