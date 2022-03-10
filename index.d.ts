import { Logger } from "log4js";
import { Level, Option, Log4js } from "./src/console";
export { Level, Option };
export class ConsoleBuilder {
  constructor(option?: Option);
  base: string;
  option: Option;
  logger: Logger;
  console: Console;
  log4js: Log4js;
  onLog(
    callback: (
      console: Console,
      logger: Logger
    ) => void | undefined | ((console: Console, logger: Logger) => any)
  ): any;
  onInfo(
    callback: (
      console: Console,
      logger: Logger
    ) => void | undefined | ((console: Console, logger: Logger) => any)
  ): any;
  onError(
    callback: (
      console: Console,
      logger: Logger
    ) => void | undefined | ((console: Console, logger: Logger) => any)
  ): any;
  onWarn(
    callback: (
      console: Console,
      logger: Logger
    ) => void | undefined | ((console: Console, logger: Logger) => any)
  ): any;
  onDebug(
    callback: (
      console: Console,
      logger: Logger
    ) => void | undefined | ((console: Console, logger: Logger) => any)
  ): any;
  initOption(option?: Option): this;
  rewriteConsole(): this;
}
export type auto = () => any;
