/**
 * Menu system and user interaction
 */
import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import InterruptedPrompt from 'inquirer-interrupted-prompt';
import { REGION_TYPES } from '../utils/constants.js';
import * as logger from '../utils/logger.js';
import * as display from './display.js';
import * as dataService from '../services/dataService.js';
import * as config from '../core/config.js';

// Register autocomplete prompt with interruption support
inquirer.registerPrompt('autocomplete', InterruptedPrompt.from(autocompletePrompt));

/**
 * Main menu definition
 */
const mainMenuItems = [
  { 
    name: "🔎 Søk etter badeplass", 
    action: searchForBeach 
  },
  { 
    name: "🗺  Velg fylke", 
    action: chooseRegion, 
    param: REGION_TYPES.COUNTY 
  },
  { 
    name: "📍 Velg kommune", 
    action: chooseRegion, 
    param: REGION_TYPES.MUNICIPALITY 
  },
  { 
    name: "📈 Høyeste badetemperaturer i dag", 
    action: getHighestTemperatures 
  },
  { 
    name: "⚙️  Endre innstillinger", 
    action: showSettingsMenu 
  },
  { 
    name: "❓ Hjelp", 
    action: showHelpAndMenu 
  },
  { 
    name: "👋 Avslutt", 
    action: quitApp 
  }
];

/**
 * Show the main menu and handle selection
 */
export function showMainMenu() {
  const temperatureCount = dataService.getTemperatures().length;
  const welcomeMessage = display.getWelcomeMessage(temperatureCount);
  
  return showMenu(
    mainMenuItems,
    "Main Menu",
    welcomeMessage
  );
}

/**
 * Generic menu display function
 * @param {Array} choices - List of menu choices
 * @param {string} title - Menu title
 * @param {string} message - Menu message
 * @param {string} [type="list"] - Inquirer prompt type
 * @param {Function} [defaultAction] - Default action for all items
 * @param {any} [defaultParam] - Default parameter for all items
 * @return {Promise} Promise that resolves to the selected action
 */
export function showMenu(choices, title, message, type = "list", defaultAction, defaultParam) {
  title && logger.debug(`Listing ${title}`);
  
  return inquirer.prompt([{
    type: type,
    name: "name",
    message: message,
    choices: choices,
    interruptedKeyname: 'escape'
  }])
    .then((answerObj) => {
      let answer = choices.find(choice => choice.name === answerObj.name);
      
      if (defaultAction) { 
        answer.action = defaultAction;
      }
      
      if (defaultParam) { 
        answer.param = { key: defaultParam, value: answer.val };
      }
      
      return answer && answer.action(answer.param);
    }, (err) => {
      logger.debug(`Error in menu: ${err}`);
      quitApp();
    });
}

/**
 * Search for a beach by name
 * @param {Array} [beaches] - Optional array of beaches to search within
 * @param {boolean} [sortByTemp=false] - Whether to sort by temperature
 */
function searchForBeach(beaches = dataService.getTemperatures(), sortByTemp = false) {
  logger.clearConsole();
  
  // Sort the beaches
  beaches = sortByTemp
    ? [...beaches].sort((a, b) => b.temperature - a.temperature)
    : [...beaches].sort((a, b) => a.location.name.localeCompare(b.location.name));
  
  // Format beach names for the list
  const beachNames = beaches.map(beach => display.formatBeachListItem(beach));
  const settings = config.getSettings();
  
  // Show the search prompt
  inquirer.prompt([{
    type: 'autocomplete',
    name: 'name',
    pageSize: settings.beachCount,
    message: 'Søk etter badeplass (esc for å gå tilbake til menyen)',
    interruptedKeyname: 'escape',
    source: (_, srch) => {
      return !srch ? beachNames
        : beachNames.filter(b => b.toLowerCase().includes(srch.toLowerCase()));
    },
  }])
    .then((answer) => {
      // Extract the beach name (it's before the non-breaking space)
      answer.name = answer.name.split('\u00a0')[0];
      logger.debug(`Beach chosen: ${answer.name}`);
      
      // Find the chosen beach
      const chosenBeach = dataService.findBeachByName(answer.name);
      
      if (chosenBeach) {
        logger.clearConsole();
        display.displayTemperature(chosenBeach, settings);
      } else {
        logger.error(`Beach not found: ${answer.name}`);
      }
    }, (err) => {
      logger.debug(err);
      logger.clearConsole();
      showMainMenu();
    });
}

/**
 * Choose a region (county, municipality, or beach)
 * @param {object} regionType - The type of region to choose
 */
function chooseRegion(regionType) {
  logger.debug(`Listing region type ${regionType.name}`);
  
  // Get the appropriate list of regions
  let regions;
  
  if (regionType === REGION_TYPES.COUNTY) {
    regions = dataService.getCounties();
  } else if (regionType === REGION_TYPES.MUNICIPALITY) {
    regions = dataService.getMunicipalities();
  } else {
    regions = dataService.getBeaches();
  }
  
  regions = regions.filter(Boolean);
  logger.debug(`Got ${regions.length} ${regionType.plural}`);
  
  // Show the region selection menu
  return inquirer.prompt([{
    type: 'autocomplete',
    name: "name",
    pageSize: 20,
    message: `Velg ${regionType.localName}`,
    choices: regions,
    interruptedKeyname: 'escape',
    source: (_, srch) => {
      return !srch ? regions
        : regions.filter(r => r.toLowerCase().includes(srch.toLowerCase()));
    },
  }]).then(regionChoice => {
    logger.debug(`Region choice: ${regionChoice.name}`);
    
    if (regionType === REGION_TYPES.BEACH) {
      const beach = dataService.findBeachByName(regionChoice.name);
      if (beach) {
        display.displayTemperature(beach, config.getSettings());
      }
    } else if (regionType === REGION_TYPES.COUNTY) {
      searchForBeach(dataService.getBeachesByCounty(regionChoice.name));
    } else if (regionType === REGION_TYPES.MUNICIPALITY) {
      searchForBeach(dataService.getBeachesByMunicipality(regionChoice.name));
    }
  }, (err) => {
    logger.debug(`Error: ${err}`);
    showMainMenu();
  });
}

/**
 * Show beaches with the highest temperatures first
 */
function getHighestTemperatures() {
  searchForBeach(dataService.getBeachesByTemperature(), true);
}

/**
 * Show settings menu
 */
export function showSettingsMenu() {
  const settingsMenuItems = [
    { 
      name: "Endre standard utskrift", 
      action: showSettingOptions, 
      param: config.SETTING_TYPES.OUTPUT_FORMAT 
    },
    { 
      name: "Endre standard badeplass", 
      action: showSettingOptions, 
      param: config.SETTING_TYPES.DEFAULT_BEACH 
    },
    { 
      name: "Endre antall badeplasser som skal vises", 
      action: showSettingOptions, 
      param: config.SETTING_TYPES.BEACH_COUNT 
    },
    { 
      name: "Endre cache timeout", 
      action: showSettingOptions, 
      param: config.SETTING_TYPES.CACHE_TIMEOUT 
    },
    { 
      name: "Kjør Badevann i debug-modus", 
      action: showSettingOptions, 
      param: config.SETTING_TYPES.DEBUG_MODE 
    },
    { 
      name: "Gå tilbake til menyen", 
      action: showMainMenu 
    }
  ];
  
  showMenu(settingsMenuItems, "Settings Menu", "Endre instillinger");
}

/**
 * Show options for a specific setting
 * @param {object} setting - The setting definition object
 */
function showSettingOptions(setting) {
  // Update beach choices if this is the default beach setting
  if (setting.name === 'defaultBeach') {
    setting.choices = dataService.getBeaches();
  }
  
  showMenu(
    setting.choices, 
    setting.message, 
    "Endre instilling", 
    setting.type, 
    updateSetting, 
    setting.name
  );
}

/**
 * Update a user setting and save it
 * @param {object} setting - The setting to update {key, value}
 */
async function updateSetting(setting) {
  logger.debug(`Updating setting: ${JSON.stringify(setting)}`);
  
  await config.updateSetting(setting.key, setting.value);
  console.log("Innstillingene er lagret");
  
  showMainMenu();
}

/**
 * Show help and return to main menu
 */
function showHelpAndMenu() {
  logger.clearConsole();
  display.displayHelp();
  showMainMenu();
}

/**
 * Show help and exit
 */
export function showHelpAndExit() {
  logger.clearConsole();
  display.displayHelp();
  process.exit(0);
}

/**
 * Quit the application
 */
export function quitApp() {
  logger.clearConsole();
  display.displayFarewell();
  process.exit(0);
}