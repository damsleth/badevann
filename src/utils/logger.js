/**
 * Logger utilities for consistent logging across the application
 */
import chalk from 'chalk';

let isDebugMode = false;

/**
 * Set the debug mode for the logger
 * @param {boolean} value - Whether debug mode is enabled
 */
export function setDebugMode(value) {
  isDebugMode = value;
}

/**
 * Log a message when in debug mode
 * @param {string} message - The message to log
 */
export function debug(message) {
  if (isDebugMode) {
    console.log(chalk.yellowBright(message));
  }
}

/**
 * Log an error message
 * @param {Error|string} error - The error to log
 */
export function error(error) {
  const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : error;
  console.error(chalk.redBright(`ERROR: ${errorMessage}`));
}

/**
 * Log an info message regardless of debug mode
 * @param {string} message - The message to log
 */
export function info(message) {
  console.log(message);
}

/**
 * Clear the console if not in debug mode
 */
export function clearConsole() {
  if (!isDebugMode) {
    console.clear();
  }
}