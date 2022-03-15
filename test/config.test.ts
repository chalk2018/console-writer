import {ConsoleBuilder,Level} from '../src/console';
console.log("打印日志 - ConsoleBuilder - before")
new ConsoleBuilder({
    // autoRewrite: true, // if false : You can actively call rewriteConsole to intercept the console
    // autoInitOption: true
    useConfig:true,
    configFileName: 'test/config.js'
});
console.log("打印日志 - ConsoleBuilder - after")
console.log("-----------------------------")
