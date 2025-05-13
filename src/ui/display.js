/**
 * Display utilities for formatting and showing beach data
 */
import chalk from 'chalk';
import { hasArg } from '../utils/args.js';
import { getColoredTemperature, getTemperatureEmoji, formatDate } from '../utils/formatter.js';
import * as logger from '../utils/logger.js';

/**
 * Display a short temperature output (just the temperature)
 * @param {object} beach - The beach data object
 * @return {string} Formatted temperature string
 */
export function formatShortTemperature(beach) {
  return getColoredTemperature(beach.temperature);
}

/**
 * Display a regular temperature output (name, date, and temperature)
 * @param {object} beach - The beach data object
 * @return {string} Formatted temperature string
 */
export function formatRegularTemperature(beach) {
  return `${beach.location.name} ${formatDate(beach.time)}: ${getColoredTemperature(beach.temperature)}`;
}

/**
 * Display an ISO-formatted temperature output (name, ISO date, and temperature)
 * @param {object} beach - The beach data object
 * @return {string} Formatted temperature string
 */
export function formatIsoTemperature(beach) {
  return `${beach.location.name} ${formatDate(beach.time)}: ${getColoredTemperature(beach.temperature)}`;
}

/**
 * Display a long temperature output (detailed information)
 * @param {object} beach - The beach data object
 * @return {string} Formatted temperature string
 */
export function formatLongTemperature(beach) {
  return `
🔆 ${beach.location.name.toUpperCase()} - ${beach.location.category.name}
Badetemperatur\t: ${getColoredTemperature(beach.temperature)}
Måletidspunkt\t: ${formatDate(beach.time, true)}
Lokasjon\t: ${beach.location.urlPath}
Kart\t\t: https://google.com/maps?q=${beach.location.position.lat},${beach.location.position.lon}
${beach.sourceDisplayName ? `Kilde\t\t: ${beach.sourceDisplayName}` : ''}
`;
}

/**
 * Display a beach item for selection lists
 * @param {object} beach - The beach data object
 * @param {number} [padLength=32] - Padding length for alignment
 * @return {string} Formatted beach item
 */
export function formatBeachListItem(beach, padLength = 32) {
  const name = beach.location.name;
  const padding = Array.from(" ".repeat(Math.max(1, padLength - name.length))).join('');
  const emoji = getTemperatureEmoji(beach.temperature);
  const temperature = getColoredTemperature(beach.temperature);
  
  return `${name}\u00a0${padding} ${emoji} ${temperature}`;
}

/**
 * Display a temperature according to format preferences
 * @param {object} beach - The beach data object
 * @param {object} settings - User settings object
 */
export function displayTemperature(beach, settings) {
  logger.debug(`Displaying temperature for ${beach.location.name}`);
  
  // Handle command-line overrides first
  if (hasArg('short') || hasArg('s') || settings.outputFormat === 'tempOnly') {
    console.log(formatShortTemperature(beach));
  } else if (hasArg('verbose') || hasArg('v') || hasArg('l') || settings.outputFormat === 'long') {
    console.log(formatLongTemperature(beach));
  } else if (hasArg('iso') || hasArg('i') || settings.outputFormat === 'iso') {
    console.log(formatIsoTemperature(beach));
  } else {
    console.log(formatRegularTemperature(beach));
  }
  
  // In debug mode, show the raw data
  logger.debug(JSON.stringify(beach, null, 2));
}

/**
 * Display application help text
 */
export function displayHelp() {
  console.log(`
    ${chalk.yellowBright('BADEVANN')}
    Denne konsollappen henter vanntemperaturer fra internett og lister ut resultatet i konsollen.

    ${chalk.yellowBright('BRUK')}
    'badevann' lar deg velge badeplass fra en liste.
    Alternativt kan du skrive 'badevann <badeplass>', så henter den ut temperaturer for <badeplass>

    ${chalk.yellowBright('PARAMETRE')}:
    help | h: vis denne teksten
    verbose | v: vis mer utfyllende info om badeplassen sammen med vanntemperaturen
    iso | i : vis tidspunkt for måleravlesning på ISO 8601-format
    short | s: vis bare vanntemperatur
    nocolor: ikke fargelegg badetemperaturene
    debug | d : vis utfyllende info ved bruk

    ${chalk.yellowBright('OM DATAENE')}:
    Dataene kommer primært fra yr.no.  
    Ved feil i appen, sjekk nettsiden eller lag et issue på github.  
    Denne appen er skrevet av @damsleth <https://github.com/damsleth>
  `);
}

/**
 * Display a welcome message for the main menu
 * @param {number} temperatureCount - Number of available temperatures
 * @return {string} The welcome message
 */
export function getWelcomeMessage(temperatureCount) {
  return `Velkommen til Badevann! 🏖\n🔆 ${temperatureCount} oppdaterte badetemperaturer`;
}

/**
 * Display a farewell message when quitting
 */
export function displayFarewell() {
  console.log(chalk.cyanBright("\n\t  🔆 Hopp i havet! 🏖\n"));
}