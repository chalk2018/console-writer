import * as log4js from "log4js";
import * as path from "path";
declare const globalThis: {
  console: globalThis.Console;
  __console: globalThis.Console;
};
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
type LogType = keyof typeof consoleProperty;
export type Log4js = typeof log4js;
// const { configure, getLogger } = log4js;
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
export enum Level {
  "all" = "all",
  "debug" = "debug",
  "info" = "info",
  "warn" = "warn",
  "error" = "error",
  "off" = "off",
}
export interface Option {
  // 控制台配置
  backup?: boolean; // 是否备份文件
  fileName?: string; // log文件名
  logDir?: string; // log文件输出路径（相对路径）
  backupSize?: number; // log文件最大size，超出备份
  backupCount?: number; // 最大备份数量
  backupZip?: boolean; // 是否压缩备份文件
  level?: Level; // 允许log文件输出级别
  // 手动配置log4js
  configLog4js?: (
    log4js,
    setLogger: (logger) => any,
    rewriteConsole: () => any
  ) => any;
  // 其他配置
  disabledConsole?: boolean; // 是否阻止控制台输出
  autoRewrite?: boolean; // 默认覆盖重写
  useConfig?: boolean; // 是否读取config文件
  autoInitOption?: boolean; // 自动初始化
  configFileName?: string; // 配置文件名字（相对路径格式）
}
const defaultOption: Option = {
  backup: true,
  fileName: "console.log",
  logDir: "logs",
  backupSize: 10485760, // 1024 * 1024
  backupCount: 3,
  backupZip: true,
  level: Level.all,
  disabledConsole: false,
  autoRewrite: false,
  useConfig: false,
  autoInitOption: false,
  configFileName: "cw.config.js",
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
export class ConsoleBuilder extends Map {
  constructor(option?: Option) {
    super();
    // 备份原始console
    globalThis.__console = globalThis.console;
    // 获取log4js
    this.set("log4js", require("log4js"));
    // 获取项目运行根目录
    const basePath = path.resolve();
    // 记录根目录
    this.set("basePath", basePath);
    // 记录option
    this.set("option", option);
    if (option?.useConfig ?? defaultOption.useConfig) {
      this.configResolver(
        option?.configFileName || defaultOption.configFileName
      );
    }
    // this.console.log(this.option)
    // 初始化
    if (option?.autoInitOption ?? this.option?.autoInitOption ?? defaultOption.autoInitOption) {
      this.initOption(this.option);
      // this.console.log('initOption')
    }
    // 重写
    if (option?.autoRewrite ?? this.option?.autoRewrite ?? defaultOption.autoRewrite) {
      this.rewriteConsole();
      // this.console.log('rewriteConsole')
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
    return this.get("log4js");
  }

  // 反射重写后的console的log/info/warn/error/debug
  get log() {
    return console.log;
  }
  get info() {
    return console.info;
  }
  get warn() {
    return console.warn;
  }
  get error() {
    return console.error;
  }
  get debug() {
    return console.debug;
  }

  // hooks
  onLog(
    callback: (console, logger) => void | undefined | ((console, logger) => any)
  ) {
    this.set("on_log", callback);
  }

  onInfo(
    callback: (console, logger) => void | undefined | ((console, logger) => any)
  ) {
    this.set("on_info", callback);
  }

  onError(
    callback: (console, logger) => void | undefined | ((console, logger) => any)
  ) {
    this.set("on_error", callback);
  }

  onWarn(
    callback: (console, logger) => void | undefined | ((console, logger) => any)
  ) {
    this.set("on_warn", callback);
  }

  onDebug(
    callback: (console, logger) => void | undefined | ((console, logger) => any)
  ) {
    this.set("on_debug", callback);
  }

  private hookingStart(logType: LogType) {
    const hook = this.get("on_" + logType);
    if (hook) {
      return hook(this.console, this.logger);
    } else {
      return undefined;
    }
  }

  private hookingEnd(
    logType: LogType,
    hooksMap: { [hook: string]: (console, logger) => any }
  ) {
    const hook = this.get("on_" + logType);
    if (hook) {
      if (
        Object.prototype.toString.call(hooksMap[logType]) ===
          "[object Function]" ||
        Object.prototype.toString.call(hooksMap[logType]) ===
          "[object AsyncFunction]"
      ) {
        hooksMap[logType](this.console, this.logger);
      }
    }
  }

  private configResolver(fileName?: string) {
    try {
      const conf = require(path.join(
        this.base,
        fileName ?? defaultOption.configFileName
      ));
      // console.log(conf);
      const _option = { ...this.option, ...conf.option };
      this.set("option", _option);
    } catch (err) {
      // 读取文件异常
      this.console.error(err);
    }
  }

  private shutdown() {
    return new Promise((resolve, _) => {
      this.log4js.shutdown(() => {
        resolve(this.log4js);
      });
    });
  }

  async closeLog4js() {
    try {
      await this.shutdown();
      return this.log4js;
    } catch (err) {
      throw err;
    }
  }

  initOption(option?: Option) {
    const { configure, getLogger } = this.log4js;
    // 还原console
    globalThis.console = this.console;
    //
    if (option === undefined) {
      option = this.option;
    } else {
      this.set("option", option);
    }
    // 配置log4js
    if (option?.configLog4js) {
      option.configLog4js(
        this.log4js,
        (logger) => {
          this.set("logger", logger);
        },
        this.rewriteConsole.bind(this)
      );
    } else {
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
        // // 重写
        // if (option?.autoRewrite ?? defaultOption.autoRewrite) {
        //   this.rewriteConsole();
        // }
      } else {
        configure({
          appenders: {
            loggerStore: {
              type: "file",
              filename: path.join(
                option?.logDir || defaultOption.logDir,
                option?.fileName || defaultOption.fileName
              ),
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
        // // 重写
        // if (option?.autoRewrite ?? defaultOption.autoRewrite) {
        //   this.rewriteConsole();
        // }
      }
    }
    return this;
  }

  private output(logType: LogType, msgs: Array<string>) {
    const _this = this;
    if (logType === "log" || logType === "info") {
      (_this.logger.info as any)(...msgs);
    } else if (logType === "error" || logType === "exception") {
      (_this.logger.error as any)(...msgs);
    } else if (logType === "warn") {
      (_this.logger.warn as any)(...msgs);
    } else if (logType === "debug") {
      (_this.logger.debug as any)(...msgs);
    }
  }

  private logWriter(logType: LogType, context?: any) {
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
      if (
        typeof arg1 === "string" &&
        ["%o", "%O", "%d", "%i", "%s", "%f"].some(
          (fmt: string) => arg1.indexOf(fmt) >= 0
        )
      ) {
        // 模板输出格式
        let i = 1;
        (arg1 as any).replaceAll(/(%o)|(%O)|(%d)|(%i)|(%s)|(%f)/g, (v, l) => {
          const re = args[i];
          i++;
          return re;
        });
      } else {
        // 直接输出格式
        const argStrs = args.map((arg) => {
          if (Object.prototype.toString.call(arg) === "[object Number]") {
            return String(arg);
          } else if (
            Object.prototype.toString.call(arg) === "[object Boolean]"
          ) {
            return String(arg);
          } else if (
            Object.prototype.toString.call(arg) === "[object String]"
          ) {
            return arg;
          } else if (
            Object.prototype.toString.call(arg) === "[object Undefined]"
          ) {
            return String(arg);
          } else if (Object.prototype.toString.call(arg) === "[object Null]") {
            return String(arg);
          } else if (
            Object.prototype.toString.call(arg) === "[object Object]"
          ) {
            try {
              const jsonStr = JSON.stringify(arg);
              return jsonStr;
            } catch (e) {
              return "";
            }
          } else if (Object.prototype.toString.call(arg) === "[object Array]") {
            try {
              const jsonStr = JSON.stringify(arg);
              return jsonStr;
            } catch (e) {
              return "";
            }
          } else {
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
    // 非自动重写时，重置option
    if (this.option?.autoRewrite ?? defaultOption.autoRewrite) {
      // do nothing
    } else {
      this.initOption();
    }
    if (this.get("console")) {
      globalThis.console = this.get("console");
    } else {
      // 代理重写
      globalThis.console = new Proxy(this.console, {
        get(target: any, propertyKey: LogType, receiver) {
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
            const fn = (...args: any) => {
              // 触发钩子
              const resultHook = _this.hookingStart(propertyKey);
              // 写入log
              _this.logWriter(propertyKey, target)(...args);
              // 调用原方法
              let consoleRes = undefined;
              if (_this.option?.disabledConsole) {
                consoleRes = undefined;
              } else {
                consoleRes = target[propertyKey].call(target, ...args);
              }
              // 结束hook触发
              _this.hookingEnd(propertyKey, { [propertyKey]: resultHook });
              return consoleRes;
            };
            return fn;
          } else {
            return Reflect.get(target, propertyKey, receiver);
          }
        },
      });
      this.set("console", globalThis.console);
    }
    return _this;
  }
}
// 自动配置
export const auto = () => {
  const console = new ConsoleBuilder({
    useConfig: true, // 自动调用配置
    autoInitOption: false, // false就是需要调用initOption
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
