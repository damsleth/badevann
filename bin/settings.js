import { promises as fs } from 'fs'
import { showMainMenu, showMenu } from './actions.js'
import { log } from './utils.js'
import { beaches } from './tempdata.js'

var UserSettingTypes = {
  Output: {
    name: "defaultOutput", type: "list",
    message: "Hvilken utskrift skal brukes som standard?",
    choices: ["Kun temperatur", "Kortversjon", "Langversjon", "ISO"],
    default: "Kortversjon"
  },
  DefaultBeach: {
    name: "defaultBeach", type: "list",
    message: "Hvilken badeplass skal brukes som standard?",
    choices: beaches,
    default: ""
  },
  BeachCount: {
    name: "beachCount", type: "number",
    message: "Hvor mange badeplasser skal vises av gangen?",
    type: "input",
    default: 100
  },
  CacheTimeout: {
    name: "cacheTimeout", type: "number",
    message: "Hvor lenge skal data mellomlagres (i minutter)?",
    type: "input",
    default: 480
  },
}

export async function changeSettings() {
  let settings = await getUserSettings()
  let settingsChoices = [
    { name: "Endre standard utskrift", action: updateUserSettings, param: UserSettingTypes.Output },
    { name: "Endre standard badeplass", action: updateUserSettings, param: UserSettingTypes.DefaultBeach },
    { name: "Endre antall badeplasser som skal vises", action: updateUserSettings, param: UserSettingTypes.BeachCount },
    { name: "Endre cache timeout", action: updateUserSettings, param: UserSettingTypes.CacheTimeout },
    { name: "Gå tilbake til menyen", action: showMainMenu }
  ]
  showMenu(settingsChoices,"Settings Menu","Endre instillinger")
}

export async function updateUserSettings(key, value) {
  console.log(`Updating settings for ${key} - NOOP YET`)
  showMainMenu()
}

/**
 * 
 * @returns {Promise<object>} JSON object with settings
 */
export async function getUserSettings() {
  try {
    log(`Reading settings from ${settingsFile}`)
    const settingsFile = await fs.readFile('./settings.json', 'utf8')
    if (settingsFile) {
      log(`Settings file length: ${settingsFile.length}`)
      let settings = JSON.parse(settingsFile)
      return settings
    }
  } catch (err) {
    log("No settings file found, creating one")
    return await createUserSettings()
  }
}

async function createUserSettings() {
  let settings = {}
  for (let key in UserSettingTypes) {
    let setting = UserSettingTypes[key]
    settings[setting.name] = setting.default
  }
  await fs.writeFile('./settings.json', JSON.stringify(settings))
}