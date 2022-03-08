// import path from 'path'
import resolve from 'rollup-plugin-node-resolve'; // 依赖引用插件
// import commonjs from '@rollup/plugin-commonjs'; // commonjs模块转换插件, es5/nodejs转es6
// import babel from 'rollup-plugin-babel'; // es6转es5
import {
    uglify
} from 'rollup-plugin-uglify'; // 压缩代码
const plugins = [
    // nodejs 插件
    resolve({
        extensions: ['.js', '.ts']
    }),
    // babel(),
    // commonjs读取插件
    // commonjs({
    //     // exclude: ['node_modules/fs-extra/lib/index.js'],
    //     extensions: ['.js', '.ts']
    // }),
    // 压缩代码
    uglify({
        output: {
            comments: function(node, comment) {
                // 不保留注释
                return false;
            }
        }
    })
]

export default [{
    input: 'esm/console.js',
    output: {
        file: 'lib/console.js',
        format: 'es',
        name: 'console',
    },
    plugins
}]