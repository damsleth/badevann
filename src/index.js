/**
 * Main application entry point
 */
import { hasArg, initializeDebugMode } from './utils/args.js';
import * as logger from './utils/logger.js';
import * as config from './core/config.js';
import * as dataService from './services/dataService.js';
import * as ui from './ui/index.js';

/**
 * Initialize the application
 * @return {Promise<void>}
 */
async function initialize() {
  try {
    // Initialize debug mode
    initializeDebugMode();
    
    // Load user settings
    await config.loadSettings();
    
    // Load temperature data
    await dataService.getTemperatureData();
    
    // Handle command-line arguments
    if (hasArg('help') || hasArg('h') || hasArg('?')) {
      return ui.showHelpAndExit();
    }
    
    // Handle direct beach lookup from command line
    const arg = process.argv[2];
    if (arg && !arg.startsWith('-')) {
      const name = arg.toLowerCase();
      
      // Look for exact match first
      let beach = dataService.findBeachByName(name);
      
      // If not found, try fuzzy search
      if (!beach) {
        logger.debug(`Could not find exact match for '${name}', trying fuzzy search`);
        const results = dataService.searchBeaches(name);
        
        if (results.length > 0) {
          beach = results[0];
          logger.debug(`Found ${results.length} matches, using '${beach.location.name}'`);
        }
      }
      
      if (beach) {
        ui.displayTemperature(beach, config.getSettings());
        return process.exit(0);
      } else {
        console.log(`Fant ikke badetemperatur for '${name}'\n`);
      }
    }
    
    // Clear console and show main menu
    logger.clearConsole();
    logger.debug("Showing main menu");
    ui.showMainMenu();
  } catch (error) {
    logger.error(error);
    console.log("ERROR! quitting");
    process.exit(1);
  }
}

// Start the application
initialize();