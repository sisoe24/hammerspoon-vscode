import * as path from "path";

import { appendFileSync, writeFileSync } from "fs";

export const logPath = path.join(path.resolve(__dirname, ".."), "log");

/**
 * Base Logger class for writing message to file or console.
 */
export class Logger {
    logFile: string;
    logName: string;
    printToConsole = false;

    constructor(logName: string, logFile?: string) {
        this.logName = logName;

        logFile = logFile || "log";
        this.logFile = path.join(logPath, `${logFile}.log`);
    }

    /**
     * Justify text to the left.
     *
     * @param text text from where to start the justification
     * @param length optional length count. default is 10
     * @returns
     */
    private ljust(text: string, length = 10): string {
        const diff = length - text.length;
        return text + " ".repeat(diff >= 0 ? diff : 0);
    }

    /**
     * Check if log should print to `stdout`.
     *
     * @param items optional items to log
     * @returns
     */
    private toConsole(items: any[]): any[] {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "console")) {
                this.printToConsole = item.console;
                items.splice(i, 1);
            }
        }
        return items;
    }

    /**
     * Log to file
     *
     * @param level level of the logger: debug, info warning, error, critical
     * @param message message to write
     * @param items optional items to write
     */
    private log(level: string, message: string, items: any[]): void {
        this.printToConsole = false;

        items = this.toConsole(items);

        if (items.length > 0) {
            const optionalItems = JSON.stringify(items, undefined);
            message = this.ljust(level) + this.ljust(`${message} ${optionalItems}`);
        } else {
            message = this.ljust(level) + this.ljust(message);
        }

        appendFileSync(this.logFile, message.trim() + "\n");

        if (this.printToConsole) {
            console.log(message);
        }
    }

    /**
     * Clean log file.
     */
    cleanFile(): void {
        writeFileSync(this.logFile, "");
    }

    /**
     * Write to log debug level
     *
     * @param message message to write
     * @param items optional items to write. if `{console: true}` is passed, then
     * will write to `stdout`.
     */
    debug(message: string, ...items: any[]): void {
        this.log("[DEBUG]", message, items);
    }

    /**
     * Write to log info level
     *
     * @param message message to write
     * @param items optional items to write. if `{console: true}` is passed, then
     * will write to `stdout`.
     */
    info(message: string, ...items: any[]): void {
        this.log("[INFO]", message, items);
    }

    /**
     * Write to log warning level
     *
     * @param message message to write
     * @param items optional items to write. if `{console: true}` is passed, then
     * will write to `stdout`.
     */
    warning(message: string, ...items: any[]): void {
        this.log("[WARNING]", message, items);
    }

    /**
     * Write to log error level
     *
     * @param message message to write
     * @param items optional items to write. if `{console: true}` is passed, then
     * will write to `stdout`.
     */
    error(message: string, ...items: any[]): void {
        this.log("[ERROR]", message, items);
    }

    /**
     * Write to log critical level
     *
     * @param message message to write
     * @param items optional items to write. if `{console: true}` is passed, then
     * will write to `stdout`.
     */
    critical(message: string, ...items: any[]): void {
        this.log("[CRITICAL]", message, items);
    }
}
