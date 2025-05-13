/**
 * Application configuration and settings management
 */
import pkg from 'fs-extra';
import { SETTINGS_FILE_PATH } from '../utils/constants.js';
import * as logger from '../utils/logger.js';

const { outputJson, readFile, stat } = pkg;

// Default settings
const DEFAULT_SETTINGS = {
  outputFormat: 'long',         // Output format (short, long, iso, tempOnly)
  defaultBeach: '',             // Default beach to display
  beachCount: 20,               // Number of beaches to show in listings
  cacheTimeout: 60,             // Cache timeout in minutes
  debugMode: false              // Debug mode toggle
};

// Current settings
let userSettings = { ...DEFAULT_SETTINGS };

/**
 * Setting type definitions for the settings menu
 */
export const SETTING_TYPES = {
  OUTPUT_FORMAT: {
    name: "outputFormat",
    type: "list",
    message: "Hvilken utskrift skal brukes som standard?",
    choices: [
      { name: "Kun temperatur", val: "tempOnly" }, 
      { name: "Kortversjon", val: "short" }, 
      { name: "Langversjon", val: "long" }, 
      { name: "ISO", val: "iso" }
    ],
    default: DEFAULT_SETTINGS.outputFormat
  },
  DEFAULT_BEACH: {
    name: "defaultBeach",
    type: "list",
    message: "Hvilken badeplass skal brukes som standard?",
    choices: [], // Will be populated dynamically
    default: DEFAULT_SETTINGS.defaultBeach
  },
  BEACH_COUNT: {
    name: "beachCount",
    message: "Hvor mange badeplasser skal vises av gangen?",
    type: "list",
    choices: [
      { name: "5", val: 5 }, 
      { name: "10", val: 10 }, 
      { name: "15", val: 15 }, 
      { name: "20", val: 20 }, 
      { name: "50", val: 50 }
    ],
    default: DEFAULT_SETTINGS.beachCount
  },
  CACHE_TIMEOUT: {
    name: "cacheTimeout",
    type: "list",
    message: "Hvor lenge skal data mellomlagres? (standard er 1 time)",
    choices: [
      { name: "0 (ingen cache)", val: 0 }, 
      { name: "5 min", val: 5 }, 
      { name: "30 min", val: 30 }, 
      { name: "1 time", val: 60 },
      { name: "4 timer", val: 240 }, 
      { name: "8 timer", val: 480 }, 
      { name: "12 timer", val: 720 }, 
      { name: "24 timer", val: 1440 }
    ],
    default: DEFAULT_SETTINGS.cacheTimeout
  },
  DEBUG_MODE: {
    name: "debugMode",
    type: "list",
    message: "Skal appen kjøres i debug-modus?",
    choices: [
      { name: "Ja", val: true }, 
      { name: "Nei", val: false }
    ],
    default: DEFAULT_SETTINGS.debugMode
  },
};

/**
 * Updates the beach choices for the default beach setting
 * @param {string[]} beaches - Array of beach names
 */
export function updateBeachChoices(beaches) {
  if (beaches && beaches.length > 0) {
    SETTING_TYPES.DEFAULT_BEACH.choices = beaches.sort();
  }
}

/**
 * Get the user's settings
 * @return {object} The current user settings
 */
export function getSettings() {
  return { ...userSettings };
}

/**
 * Load the user's settings from file
 * @return {Promise<object>} The loaded settings
 */
export async function loadSettings() {
  try {
    logger.debug(`Reading settings from ${SETTINGS_FILE_PATH}`);
    const settingsFile = await readFile(SETTINGS_FILE_PATH, { encoding: 'utf8' });
    
    if (settingsFile) {
      const settingsFileSize = (await stat(SETTINGS_FILE_PATH)).size;
      logger.debug(`Settings file size: ${settingsFileSize} bytes`);
      
      const settings = JSON.parse(settingsFile);
      userSettings = { ...DEFAULT_SETTINGS, ...settings };
      
      return userSettings;
    }
  } catch (err) {
    logger.debug("No settings file found, creating one");
    return await createDefaultSettings();
  }
}

/**
 * Create default settings file
 * @return {Promise<object>} The created settings
 */
async function createDefaultSettings() {
  try {
    await outputJson(SETTINGS_FILE_PATH, DEFAULT_SETTINGS);
    userSettings = { ...DEFAULT_SETTINGS };
    return userSettings;
  } catch (err) {
    logger.error(`Failed to create settings file: ${err.message}`);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update a specific setting
 * @param {string} key - The setting key to update
 * @param {any} value - The new value
 * @return {Promise<boolean>} Whether the update was successful
 */
export async function updateSetting(key, value) {
  try {
    if (key in userSettings) {
      userSettings[key] = value;
      await outputJson(SETTINGS_FILE_PATH, userSettings);
      logger.debug(`Updated setting: ${key} = ${value}`);
      return true;
    } else {
      logger.error(`Invalid setting key: ${key}`);
      return false;
    }
  } catch (err) {
    logger.error(`Failed to update setting: ${err.message}`);
    return false;
  }
}