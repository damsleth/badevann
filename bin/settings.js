import { showMainMenu, showMenu } from './actions.js'
import { log, settingsFileName } from './utils.js'
import { beaches } from './tempdata.js'
import pkg from 'fs-extra'
const { outputJson, readFile, stat } = pkg

export var userSettings = {}

var UserSettingTypes = {
  Output: {
    name: "outputFormat",
    type: "list",
    message: "Hvilken utskrift skal brukes som standard?",
    choices: [{ name: "Kun temperatur", val: "tempOnly" }, { name: "Kortversjon", val: "short" }, { name: "Langversjon", val: "long" }, { name: "ISO", val: "iso" }],
    default: "long"
  },
  DefaultBeach: {
    name: "defaultBeach",
    type: "list",
    message: "Hvilken badeplass skal brukes som standard?",
    choices: beaches,
    default: ""
  },
  BeachCount: {
    name: "beachCount",
    message: "Hvor mange badeplasser skal vises av gangen?",
    type: "list",
    choices: [{ name: "5", val: 5 }, { name: "10", val: 10 }, { name: "15", val: 15 }, { name: "20", val: 20 }, { name: "50", val: 50 }],
    default: 20
  },
  CacheTimeout: {
    name: "cacheTimeout",
    type: "list",
    message: "Hvor lenge skal data mellomlagres? (standard er 1 time)",
    choices: [{ name: "0 (ingen cache)", val: 0 }, { name: "5 min", val: 5 }, { name: "30 min", val: 30 }, { name: "1 time", val: 60 },
    { name: "4 timer", val: 240 }, { name: "8 timer", val: 480 }, { name: "12 timer", val: 720 }, { name: "24 timer", val: 1440 }],
    default: 60
  },
  DebugMode: {
    name: "debugMode",
    type: "list",
    message: "Skal appen kjøres i debug-modus?",
    choices: [{ name: "Ja", val: true }, { name: "Nei", val: false }],
    default: false
  },
}

/**
 * Displays the user settings menu
 * @returns {Promise<void>}
 */
export function showSettingsMenu() {
  let settingsChoices = [
    { name: "Endre standard utskrift", action: showUserSetting, param: UserSettingTypes.Output },
    { name: "Endre standard badeplass", action: showUserSetting, param: UserSettingTypes.DefaultBeach },
    { name: "Endre antall badeplasser som skal vises", action: showUserSetting, param: UserSettingTypes.BeachCount },
    { name: "Endre cache timeout", action: showUserSetting, param: UserSettingTypes.CacheTimeout },
    { name: "Kjør Badevann i debug-modus", action: showUserSetting, param: UserSettingTypes.DebugMode },
    { name: "Gå tilbake til menyen", action: showMainMenu }
  ]
  showMenu(settingsChoices, "Settings Menu", "Endre instillinger")
}

export function showUserSetting(setting) {
  showMenu(setting.choices, setting.message, "Endre instilling", setting.type, updateUserSetting, setting.name)
}

/**
 * 
 * Updates a setting and saves it to the settings file, then returns to the main menu
 * @param {string} key the setting to update
 * @param {string} value value of the setting to update
 * @returns {Promise<void>}
 */
export async function updateUserSetting(setting) {
  log("Setting: " + JSON.stringify(setting))
  log(`got user settings: ${JSON.stringify(userSettings)}`)
  userSettings[setting.key] = setting.value
  await outputJson(settingsFileName, userSettings)
  console.log("Innstillingene er lagret")
  await getUserSettings()
  showMainMenu()
}

/**
 * Returns the user settings file as an object
 * Optionally creates the file if it doesn't exist
 * @returns {Promise<object>} JSON object with settings
 */
export async function getUserSettings() {
  try {
    log(`Reading settings from ${settingsFileName}`)
    const settingsFile = await readFile(settingsFileName, { encoding: 'utf8' })
    log(`still reading`)
    if (settingsFile) {
      let settingsFileSize = (await stat(settingsFileName)).size
      log(`Settings file size: ${settingsFileSize} bytes`)
      let settings = JSON.parse(settingsFile)
      // todo ensure settings file is not corrupted and if so recreate it
      userSettings = settings
      return settings
    }
  } catch (err) {
    log("No settings file found, creating one")
    let settings = await createUserSettings()
    userSettings = settings
    return settings
  }
}

/**
 * Creates a user settings file in ~/.badevann/settings.json with default values
 * @returns {Promise<void>} 
 */
async function createUserSettings() {
  let settings = {}
  for (let key in UserSettingTypes) {
    let setting = UserSettingTypes[key]
    settings[setting.name] = setting.default
  }
  await outputJson(settingsFileName, settings)
  return settings
}