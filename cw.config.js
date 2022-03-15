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