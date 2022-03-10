"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auto = exports.ConsoleBuilder = exports.Level = void 0;
const log4js = require("log4js");
const path = require("path");
// console有效属性
const consoleProperty = {
    log: true,
    info: true,
    error: true,
    exception: true,
    warn: true,
    debug: true,
    assert: false,
    clear: false,
    context: false,
    count: false,
    countReset: false,
    dir: false,
    dirxml: false,
    group: false,
    groupCollapsed: false,
    groupEnd: false,
    memory: false,
    profile: false,
    profileEnd: false,
    table: false,
    time: false,
    timeEnd: false,
    timeLog: false,
    timeStamp: false,
    trace: false,
};
const { configure, getLogger } = log4js;
// log4js - Levels weight value
// ALL: { value: Number.MIN_VALUE, colour: 'grey' },
// TRACE: { value: 5000, colour: 'blue' },
// DEBUG: { value: 10000, colour: 'cyan' },
// INFO: { value: 20000, colour: 'green' },
// WARN: { value: 30000, colour: 'yellow' },
// ERROR: { value: 40000, colour: 'red' },
// FATAL: { value: 50000, colour: 'magenta' },
// MARK: { value: 9007199254740992, colour: 'grey' }, // 2^53
// OFF: { value: Number.MAX_VALUE, colour: 'grey' }
var Level;
(function (Level) {
    Level["all"] = "all";
    Level["debug"] = "debug";
    Level["info"] = "info";
    Level["warn"] = "warn";
    Level["error"] = "error";
    Level["off"] = "off";
})(Level = exports.Level || (exports.Level = {}));
const defaultOption = {
    backup: true,
    fileName: "console.log",
    logDir: "logs",
    backupSize: 10485760,
    backupCount: 3,
    backupZip: true,
    level: Level.all,
    disabledConsole: false,
    autoRewrite: false,
    useConfig: false,
    autoInitOption: true,
};
/**
 * 例子：
    new ConsoleBuilder({
        logDir: 'console/logs',
        fileName: 'server.log',
        disabledConsole: false,
        level: Level.all,
        backup: true,
        backupSize: 100 * 1024 * 1024,
        backupZip: false,
        backupCount: 20,
    }).rewriteConsole();
 */
class ConsoleBuilder extends Map {
    constructor(option) {
        super();
        // 备份原始console
        globalThis.__console = globalThis.console;
        // 获取项目运行根目录
        const basePath = path.resolve();
        // 记录根目录
        this.set("basePath", basePath);
        // 记录option
        this.set("option", option);
        if (option?.useConfig ?? defaultOption.useConfig) {
            this.configResolver(option?.configFileName || defaultOption.configFileName);
        }
        // 初始化
        if (option?.autoInitOption ?? defaultOption.autoInitOption) {
            this.initOption(this.option);
        }
    }
    get base() {
        return this.get("basePath");
    }
    get option() {
        return this.get("option");
    }
    get logger() {
        return this.get("logger");
    }
    get console() {
        return globalThis.__console;
    }
    get log4js() {
        return log4js;
    }
    // hooks
    onLog(callback) {
        this.set("on_log", callback);
    }
    onInfo(callback) {
        this.set("on_info", callback);
    }
    onError(callback) {
        this.set("on_error", callback);
    }
    onWarn(callback) {
        this.set("on_warn", callback);
    }
    onDebug(callback) {
        this.set("on_debug", callback);
    }
    hookingStart(logType) {
        const hook = this.get("on_" + logType);
        if (hook) {
            return hook(this.console, this.logger);
        }
        else {
            return undefined;
        }
    }
    hookingEnd(logType, hooksMap) {
        const hook = this.get("on_" + logType);
        if (hook) {
            if (Object.prototype.toString.call(hooksMap[logType]) ===
                "[object Function]" ||
                Object.prototype.toString.call(hooksMap[logType]) ===
                    "[object AsyncFunction]") {
                hooksMap[logType](this.console, this.logger);
            }
        }
    }
    configResolver(fileName) {
        try {
            const conf = require(path.join(this.base, fileName ?? "cw.config.js"));
            // console.log(conf);
            const _option = { ...this.option, ...conf.option };
            this.set("option", _option);
        }
        catch (err) {
            //
            console.log(err);
        }
    }
    initOption(option) {
        if (option === undefined) {
            option = this.option;
        }
        // 配置log4js
        if (option?.configLog4js) {
            option.configLog4js(log4js, (logger) => {
                this.set("logger", logger);
            }, this.rewriteConsole.bind(this));
        }
        else {
            if (option?.backup) {
                // 解析扩展名，默认.log
                const defaultExt = ".log";
                let extension = defaultExt;
                const fileName = option.fileName || defaultOption.fileName;
                const nameAndExt = fileName.split(".");
                if (nameAndExt.length > 1) {
                    // extension = '.' + nameAndExt.slice(-1);
                    extension = "." + nameAndExt.pop();
                }
                let categoryName = nameAndExt.join(".");
                configure({
                    appenders: {
                        loggerStore: {
                            type: "multiFile",
                            base: (option?.logDir ?? defaultOption.logDir) + "/",
                            property: "categoryName",
                            extension,
                            maxLogSize: option?.backupSize ?? defaultOption.backupSize,
                            backups: option?.backupCount ?? defaultOption.backupCount,
                            compress: option?.backupZip ?? defaultOption.backupZip,
                        },
                    },
                    categories: {
                        default: {
                            appenders: ["loggerStore"],
                            level: option?.level || defaultOption.level,
                        },
                    },
                });
                // 记录logger
                const logger = getLogger(categoryName);
                this.set("logger", logger);
                // 重写
                if (option?.autoRewrite ?? defaultOption.autoRewrite) {
                    this.rewriteConsole();
                }
            }
            else {
                configure({
                    appenders: {
                        loggerStore: {
                            type: "file",
                            filename: path.join(option?.logDir || defaultOption.logDir, option?.fileName || defaultOption.fileName),
                        },
                    },
                    categories: {
                        default: {
                            appenders: ["loggerStore"],
                            level: option?.level || defaultOption.level,
                        },
                    },
                });
                // 记录logger
                const logger = getLogger();
                this.set("logger", logger);
                // 重写
                if (option?.autoRewrite ?? defaultOption.autoRewrite) {
                    this.rewriteConsole();
                }
            }
        }
        return this;
    }
    output(logType, msgs) {
        const _this = this;
        if (logType === "log" || logType === "info") {
            _this.logger.info(...msgs);
        }
        else if (logType === "error" || logType === "exception") {
            _this.logger.error(...msgs);
        }
        else if (logType === "warn") {
            _this.logger.warn(...msgs);
        }
        else if (logType === "debug") {
            _this.logger.debug(...msgs);
        }
    }
    logWriter(logType, context) {
        const _this = this;
        const target = context ? context : this ?? null;
        function logWrite(...args) {
            if (args.length === 0) {
                return undefined;
            }
            // 格式： msgs : Array<string | number | undefined | boolean | null>
            // 格式： msgs : Array<Object>
            // 格式： msg : Format<string> , arg1 , arg2 , arg3
            const arg1 = args[0];
            if (typeof arg1 === "string" &&
                ["%o", "%O", "%d", "%i", "%s", "%f"].some((fmt) => arg1.indexOf(fmt) >= 0)) {
                // 模板输出格式
                let i = 1;
                arg1.replaceAll(/(%o)|(%O)|(%d)|(%i)|(%s)|(%f)/g, (v, l) => {
                    const re = args[i];
                    i++;
                    return re;
                });
            }
            else {
                // 直接输出格式
                const argStrs = args.map((arg) => {
                    if (Object.prototype.toString.call(arg) === "[object Number]") {
                        return String(arg);
                    }
                    else if (Object.prototype.toString.call(arg) === "[object Boolean]") {
                        return String(arg);
                    }
                    else if (Object.prototype.toString.call(arg) === "[object String]") {
                        return arg;
                    }
                    else if (Object.prototype.toString.call(arg) === "[object Undefined]") {
                        return String(arg);
                    }
                    else if (Object.prototype.toString.call(arg) === "[object Null]") {
                        return String(arg);
                    }
                    else if (Object.prototype.toString.call(arg) === "[object Object]") {
                        try {
                            const jsonStr = JSON.stringify(arg);
                            return jsonStr;
                        }
                        catch (e) {
                            return "";
                        }
                    }
                    else if (Object.prototype.toString.call(arg) === "[object Array]") {
                        try {
                            const jsonStr = JSON.stringify(arg);
                            return jsonStr;
                        }
                        catch (e) {
                            return "";
                        }
                    }
                    else {
                        return String(arg);
                    }
                });
                _this.output(logType, argStrs);
            }
        }
        return logWrite.bind(target);
    }
    rewriteConsole() {
        const _this = this;
        // 代理重写
        globalThis.console = new Proxy(this.console, {
            get(target, propertyKey, receiver) {
                // if (propertyKey === 'log') {
                // } else if (propertyKey === 'info') {
                // } else if (propertyKey === 'error') {
                // } else if (propertyKey === 'exception') {
                // } else if (propertyKey === 'warn') {
                // } else if (propertyKey === 'debug') {
                // } else {
                //     return Reflect.get(target, propertyKey, receiver);
                // }
                if (consoleProperty[propertyKey]) {
                    const fn = (...args) => {
                        // 触发钩子
                        const resultHook = _this.hookingStart(propertyKey);
                        // 写入log
                        _this.logWriter(propertyKey, target)(...args);
                        // 调用原方法
                        let consoleRes = undefined;
                        if (_this.option?.disabledConsole) {
                            consoleRes = undefined;
                        }
                        else {
                            consoleRes = target[propertyKey].call(target, ...args);
                        }
                        // 结束hook触发
                        _this.hookingEnd(propertyKey, { [propertyKey]: resultHook });
                        return consoleRes;
                    };
                    return fn;
                }
                else {
                    return Reflect.get(target, propertyKey, receiver);
                }
            },
        });
        return _this;
    }
}
exports.ConsoleBuilder = ConsoleBuilder;
// 自动配置
const auto = () => {
    const console = new ConsoleBuilder({
        useConfig: true,
        autoInitOption: false,
        autoRewrite: false, // false就是需要调用rewriteConsole
    });
    // console.opiton可以获取option信息
    console.initOption().rewriteConsole();
    // 钩子方法使用
    // using hooks (onLog, onInfo, onError, onWarn, onDebug)
    // console.onLog((console)=>{
    //     console.log('before log write');
    //     return (console) => {
    //         console.log('after log console print');
    //     }
    // })
    // console.onError((console)=>{
    //     console.log('before error write');
    //     return (console) => {
    //         console.log('after error console print');
    //     }
    // })
    return console;
};
exports.auto = auto;
//# sourceMappingURL=console.js.map