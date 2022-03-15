import {ConsoleBuilder,Level} from '../src/console';
const instance1 = new ConsoleBuilder({
    logDir: 'console/logs1',
    fileName: 'run.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
    autoRewrite: false, // if false : You can actively call rewriteConsole to intercept the console
    autoInitOption: true
});
const instance2 = new ConsoleBuilder({
    logDir: 'console/logs2',
    fileName: 'run.log',
    disabledConsole: false,
    level: Level.all,
    backup: true,
    backupSize: 100 * 1024 * 1024,
    backupZip: false,
    backupCount: 20,
    autoRewrite: false, // if false : You can actively call rewriteConsole to intercept the console
    autoInitOption: true
});

instance1.rewriteConsole(); // Actively call rewriteConsole
console.log("打印日志 - instance1 - write - 1")
console.log("-----------------------------")
instance2.rewriteConsole();
console.log("打印日志 - instance2 - write - 1")
console.log("-----------------------------")
instance1.rewriteConsole(); // Actively call rewriteConsole
console.log("打印日志 - instance1 - write - 2")
console.log("-----------------------------")
instance2.rewriteConsole();
console.log("打印日志 - instance2 - write - 2")
console.log("-----------------------------")
