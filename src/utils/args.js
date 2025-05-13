/**
 * Command line argument parsing utilities
 */
import * as logger from './logger.js'

// Process command line arguments
const args = process.argv.slice(2).map(arg => arg.toLowerCase().trim())

/**
 * Check if a specific argument or flag was provided
 * @param {string} name - The argument name to check for
 * @return {boolean} Whether the argument exists
 */
export function hasArg(name) {
  // Support for flags with or without dashes
  const normalizedName = name.replace(/^-+/, '')
  return args.some(arg => arg.replace(/^-+/, '') === normalizedName)
}

/**
 * Extract a non-flag argument at a specific position (or any non-flag if no position)
 * @param {number} [position] - Optional position to check for the argument
 * @return {string|null} The argument value or null if not found
 */
export function getPositionalArg(position) {
  // Filter out flag arguments (those starting with - or --)
  const nonFlagArgs = args.filter(arg => !arg.startsWith('-'))

  if (position !== undefined) {
    return nonFlagArgs[position] || null
  }

  return nonFlagArgs.length > 0 ? nonFlagArgs[0] : null
}

/**
 * Get all arguments as an array
 * @return {string[]} Array of all argument strings
 */
export function getAllArgs() {
  return [...args]
}

/**
 * Determine if the application is running in debug mode
 * @return {boolean} Whether debug mode is enabled
 */
export function isDebugMode() {
  return hasArg('debug') || hasArg('d')
}

/**
 * Initialize debug mode based on command line arguments
 */
export function initializeDebugMode() {
  const debugMode = isDebugMode()
  logger.setDebugMode(debugMode)

  if (debugMode) {
    logger.debug('Debug mode enabled')
    logger.debug(`Command line arguments: ${args.join(', ')}`)
  }
}