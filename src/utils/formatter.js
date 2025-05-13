/**
 * Formatting utilities for displaying beach temperature data
 */
import chalk from 'chalk';
import { hasArg } from './args.js';
import { TEMP_THRESHOLDS } from './constants.js';

/**
 * Get the appropriate color for a temperature value
 * @param {number} temperature - The temperature in Celsius
 * @return {string} The colored temperature string
 */
export function getColoredTemperature(temperature) {
  if (hasArg('nocolor')) {
    return `${temperature}°C`;
  }
  
  const color = getTemperatureColor(temperature);
  return chalk[color](`${temperature}°C`);
}

/**
 * Get the appropriate color name for a temperature value
 * @param {number} temperature - The temperature in Celsius
 * @return {string} The color name to use with chalk
 */
function getTemperatureColor(temperature) {
  switch (true) {
    case (temperature >= TEMP_THRESHOLDS.HOT):
      return 'red';
    case (temperature >= TEMP_THRESHOLDS.WARM):
      return 'yellow';
    case (temperature >= TEMP_THRESHOLDS.COMFORTABLE):
      return 'green';
    case (temperature >= TEMP_THRESHOLDS.COOL):
      return 'cyan';
    case (temperature < TEMP_THRESHOLDS.COOL):
      return 'blue';
    default:
      return 'white';
  }
}

/**
 * Get an emoji representation of a temperature
 * @param {number} temperature - The temperature in Celsius
 * @return {string} The emoji representing the temperature
 */
export function getTemperatureEmoji(temperature) {
  if (hasArg('nocolor')) {
    return '';
  }
  
  switch (true) {
    case (temperature >= TEMP_THRESHOLDS.HOT):
      return '🥵';
    case (temperature >= TEMP_THRESHOLDS.WARM):
      return '😎';
    case (temperature >= TEMP_THRESHOLDS.PLEASANT):
      return '😁';
    case (temperature >= TEMP_THRESHOLDS.COMFORTABLE):
      return '😊';
    case (temperature >= TEMP_THRESHOLDS.COOL):
      return '😑';
    case (temperature >= TEMP_THRESHOLDS.COLD):
      return '🥶';
    case (temperature < TEMP_THRESHOLDS.COLD):
      return '⛄️';
    default:
      return '🔆';
  }
}

/**
 * Format a date according to the user's preferences
 * @param {Date|string|number} date - The date to format
 * @param {boolean} includeTime - Whether to include time
 * @return {string} The formatted date string
 */
export function formatDate(date, includeTime = false) {
  const dateObj = new Date(date);
  
  if (hasArg('iso') || hasArg('i')) {
    return dateObj.toISOString();
  }
  
  if (includeTime) {
    return `${dateObj.toLocaleDateString('nb-no')} ${dateObj.toLocaleTimeString('nb-no')}`;
  }
  
  return dateObj.toLocaleDateString('nb-no');
}