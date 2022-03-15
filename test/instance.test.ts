import {ConsoleBuilder,Level} from '../src/console';
console.log("打印日志 - ConsoleBuilder - before")
new ConsoleBuilder({
    logDir: 'console/logs',
    fileName: 'run.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
    autoRewrite: true, // if false : You can actively call rewriteConsole to intercept the console
    autoInitOption: true
});
console.log("打印日志 - ConsoleBuilder - after")
console.log("-----------------------------")
