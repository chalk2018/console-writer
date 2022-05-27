# console-writer :zap:
[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver)

**这是一个可以通过console.log写入log文件的插件（适用于nodejs服务端）**
------------

### 安装
```
# install package
npm install console-writer
```
-----
### 通过console自动写入文件
> index.js是项目入口文件

1. 用法1
**index.js**
```javascript
import {auto} from 'console-writer';
auto();
console.log('first write!');
```
2. 用法2
**index.js**
```javascript
import 'console-writer/auto';
console.log('first write!');
```
> 项目根目录下会自动生成logs/console.log文件

### 配置文件
> 在项目根目录下准备一个cw.config.js文件用于配制日志输出，内容如下

**cw.config.js**
```javascript
module.exports = {
    option: {
        logDir: 'console/logs', // log输出的目录，项目工程为根目录的相对路径
        fileName: 'run.log', // log输出文件名
        disabledConsole: false, // 屏蔽控制台
        level: 'all', // 日志输出等级 : all > debug > info > warn > error > off
        // 备份日志选项
        backup: true, // 开启日志备份
        backupSize: 100 * 1024 * 1024, // 单个日志文件最大上限（字节），超过就开启新日志文件
        backupZip: false, // 是否压缩日志
        backupCount: 20, // 最大备份的文件数量
        // 实例化选项
        autoRewrite: true, // 是否自动触发重写console，false的场合：可以通过实例调用rewriteConsole()触发重写console
        autoInitOption: true // 是否自动初始化配置选项，false的场合：可以手动动态更改部分配置选项，通过rewriteConsole()重新反应新配置
    }
}
```

### 实例化 console-writer
> 通过实例化来配置console-writer
1. 用法1
> index.js是项目入口文件

**index.js**
```javascript
import {ConsoleBuilder,Level} from 'console-writer';
const instance = new ConsoleBuilder({
    logDir: 'console/logs',
    fileName: 'run.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
    autoRewrite: false,
    autoInitOption: true
});
console.log('before write!');
instance.rewriteConsole(); // 手动触发重写console
console.log('after write!');
```
> 通过"autoRewrite = false"，来控制一个实例在通过不同的配置写入到不同的文件中

2. 用法2
> index.js是项目入口文件

**index.js**
```typescript
import {ConsoleBuilder,Level} from 'console-writer';
const instance = new ConsoleBuilder({
    autoRewrite: false,
    autoInitOption: false // false的场合可以重新设置option选项
});
instance.initOption({
    logDir: 'console/logs',
    fileName: 'run1.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
})
instance.rewriteConsole();
console.log('first write!'); // 这条信息会打印在run1.log文件中
// reset option
console.initOption({
    logDir: 'console/logs',
    fileName: 'run2.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
})
instance.rewriteConsole();
console.log('second write!'); // 这条信息会打印在run2.log文件中
```

3. 用法3
> 通过配置文件
> index.js是项目入口文件

**index.js**
```javascript
import {ConsoleBuilder} from 'console-writer';
new ConsoleBuilder({
  useConfig: true,
  configFileName: "cw_conf.js" // 手动指定配置文件，默认的配置文件是项目根目录下的cw.config.js
});
console.log('log write!');
```


### Hooks
> 钩子函数，用于拦截一系列console方法
```javascript
import {ConsoleBuilder} from 'console-writer';
const {onLog,onInfo,onWarn,onError,onDebug} = new ConsoleBuilder({useConfig: true});
// console.log()触发
onLog((console)=>{
    console.log('before log write'); // 写入文件前出发，这句话不会写入到log文件中
    return (console) => {
        console.log('after log console print'); // 写入后出发，这句话也不会写入到log文件中
    }
})
// console.info()触发
onInfo(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// console.warn()触发
onWarn(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// console.error()触发
onError(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// console.debug()触发
onDebug(console=>{
    // ...
    return (console) => {
        // ...
    }
})
```

### 其他使用调用方式以及说明
1. 实例化分类
 - **可以通过实例化构建多个实例，实现一个工程下的多个项目的log分类**

2. 继承调用
 - **通过继承来封装框架**

3. 原console的备份和还原
 - **原始console被备份到globalThis.__console中**

4. 自由配置log4js
 - **可以通过配置项目中的configLog4js参数手动配置log4js，一旦手动配置log4js一些配置将失效**
