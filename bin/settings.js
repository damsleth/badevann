import { promises as fs } from 'fs'
import chalk from 'chalk'

const slugify = (str) => str.toString().toLowerCase().trim()
const args = slugify(process.argv.slice(2).toString()).split(",")
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
const log = (str) => { (hasArg('debug') || hasArg('d')) && console.log(chalk.yellowBright(str)) }

export const settings = {

  async changeSettings() {
    let settings = await getSettings()
    let settingsChoices = [
      { name: "Endre standard utskrift", action: changeDefaultOutput },
      { name: "Endre standard badeplass", action: changeDefaultBeach },
      { name: "Endre antall badeplasser som skal vises", action: changeBeachCount },
      { name: "Endre cache timeout", action: changeCacheTimeout },
      { name: "Gå tilbake til menyen", action: showMenu }
    ]
    chooseMenu(settingsChoices).then(answer => { answer && answer.action() })
  },

  async updateSettings(key, value) {


  },

  async getSettings() {
    try {
      const settingsFile = await fs.readFile('./settings.json', 'utf8')
      if (settingsFile) {
        log(`settingsFile.length: ${settingsFile.length}`)
        let settings = JSON.parse(settingsFile)
        return settings
      }
    } catch (err) {
      log("No settings file found")
      return {}
    }
  }

}

export default settings