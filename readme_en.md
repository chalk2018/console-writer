# console-writer :zap:
[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver)

**This is a plugin that can write files simply through console.log**
------------

### Install
```
# install package
npm install console-writer
```
-----
### Auto write file throw console
> this is the entry file.

1. usage1
**index.js**
```javascript
import {auto} from 'console-writer';
auto();
console.log('first write!');
```
2. usage2
**index.js**
```javascript
import 'console-writer/auto';
console.log('first write!');
```
> The logs/console.log file will be generated under the project

### Auto write file and config it
> You need to prepare a cw.config.js file in the project root directory

**cw.config.js**
```javascript
module.exports = {
    option: {
        logDir: 'console/logs', // Based on the log file directory in the project directory
        fileName: 'run.log', // The log file name
        disabledConsole: false, // Disable console output
        level: 'all', // log level : all > debug > info > warn > error > off
        backup: true, // Backup the log
        backupSize: 100 * 1024 * 1024, // Maximum size of the backup file, if backup = true
        backupZip: false, // Packing backup files, if backup = true
        backupCount: 20, // Maximum number of backup files
        autoRewrite: true, // if false : You can actively call rewriteConsole to intercept the console
        autoInitOption: true
    }
}
```

### Instantiate the console-writer
> You can configure console-writer by instantiating it
1. Usage 1
> this is the entry file.

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
    autoRewrite: false, // if false : You can actively call rewriteConsole to intercept the console
    autoInitOption: true
});
console.log('before write!');
instance.rewriteConsole(); // Actively call rewriteConsole
console.log('after write!');
```
> You can build multiple instances of ConsoleBuilder with different config throw "autoRewrite = false"

1. Usage 2
> this is the entry file.

**index.js**
```typescript
import {ConsoleBuilder,Level} from 'console-writer';
const instance = new ConsoleBuilder({
    autoRewrite: false,
    autoInitOption: false // // if false : You can reset option
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
console.log('first write!'); // This record is written to the run1.log file
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
console.log('second write!'); // This record is written to the run2.log file
```

3. Usage 3
> throw config file
> this is the entry file.

**index.js**
```javascript
import {ConsoleBuilder} from 'console-writer';
new ConsoleBuilder({
  useConfig: true,
  configFileName: "cw_conf.js" // The default file name is cw.config.js
});
console.log('log write!');
```

### Hooks
> If you got a instance of ConsoleBuilder, You can trigger the callback method when the log is output
```javascript
import {ConsoleBuilder} from 'console-writer';
const {onLog,onInfo,onWarn,onError,onDebug} = new ConsoleBuilder({useConfig: true});
// when console.log()
onLog((console)=>{
    console.log('before log write'); // This sentence will don't write in the log file
    return (console) => {
        console.log('after log console print'); // This sentence will don't write in the log file
    }
})
// when console.info()
onInfo(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// when console.warn()
onWarn(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// when console.error()
onError(console=>{
    // ...
    return (console) => {
        // ...
    }
})
// when console.debug()
onDebug(console=>{
    // ...
    return (console) => {
        // ...
    }
})
```

