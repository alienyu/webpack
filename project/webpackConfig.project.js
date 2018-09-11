function loadProjectConf(envConf) {
    let webpack = require('webpack');
    let merge = require("webpack-merge");
    let projectName = envConf.projectName;
    let projectConf = {};
    //基础配置文件
    let bascConf = require(`${process.cwd()}/build/env/webpack.base.js`);
    let platformConf = {};
    let platformList = Object.keys(envConf.deployContent);
    //提取平台相关的配置文件
    platformList.map(platformName => {
        platformConf = merge(platformConf, require(`./${platformName}/webpack.platform.js`)(envConf));
    })
    console.log("this is project")
    let commonEntry = {entry :{}};
    let entryKey = `common/${projectName}-vendor`;
    commonEntry.entry[entryKey] = ['react', 'react-dom', 'jquery', 'antd', 'vue', 'vue-router', 'vue-resource', 'vuex', 'vant'];
    //合并两端配置文件
    projectConf = merge(bascConf, {
        ...commonEntry,
        //项目通用配置（移动端和pc端共享）
        resolve: {
            alias: {
                'buildConf': `${process.cwd()}/build/config`,
                'globalConf': `${process.cwd()}/biz/common/static/config/globalConf.js`
            }
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: `common/${projectName}-vendor`,
                minChunks:Infinity
            }),
            new webpack.ProvidePlugin({
                'globalConf': 'globalConf'
            })
        ]
    }, platformConf);
    return projectConf;
}

module.exports = loadProjectConf;
