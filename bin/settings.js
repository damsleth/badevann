import { promises as fs } from 'fs'
import { showMainMenu } from './actions.js'
import { log } from './utils.js'
import { beaches } from './tempdata.js'

const SettingTypes = {
  DefaultOutput: {
    name: "defaultOutput", type: "list",
    message: "Hvilken utskrift skal brukes som standard?",
    choices: ["Kun temperatur", "Kortversjon", "Langversjon", "ISO"],
    default: "Kortversjon"
  },
  DefaultBeach: {
    name: "defaultBeach", type: "list",
    message: "Hvilken badeplass skal brukes som standard?",
    choices: beaches
  },
  DefaultBeachCount: {
    name: "defaultBeachCount", type: "number",
    message: "Hvor mange badeplasser skal vises av gangen?",
    default: 10
  },
  CacheTimeout: {
    name: "cacheTimeout", type: "number",
    message: "Hvor lenge skal data mellomlagres (i minutter)?",
    default: 480
  },
}

export async function changeSettings() {
  let settings = await getSettings()
  let settingsChoices = [
    { name: "Endre standard utskrift", action: updateSettings, param: SettingTypes.DefaultOutput },
    { name: "Endre standard badeplass", action: updateSettings, param: SettingTypes.DefaultBeach },
    { name: "Endre antall badeplasser som skal vises", action: updateSettings, param: SettingTypes.DefaultBeachCount },
    { name: "Endre cache timeout", action: updateSettings, param: SettingTypes.CacheTimeout },
    { name: "Gå tilbake til menyen", action: showMainMenu }
  ]
  chooseMenu(settingsChoices).then(answer => { answer && answer.action() })
}

export async function updateSettings(key, value) {
console.log(`Updating settings for ${key} - NOOP`)
showMainMenu
}

export async function getSettings() {
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
    let settings = {
      defaultOutput: "json",
      defaultBeach: "",
      beachCount: 5,
      cacheTimeout: 60
    }
    await fs.writeFile('./settings.json', JSON.stringify(settings))
    return settings
  }
}