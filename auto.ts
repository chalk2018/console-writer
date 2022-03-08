import { ConsoleBuilder } from "./";
const console = new ConsoleBuilder({
  useConfig: true,
  autoInitOption: false,
});
console.initOption(console.option).rewriteConsole();
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
