import chalk from 'chalk'
import inquirer from 'inquirer'
import * as settings from './settings.js'
import { counties, municipalities, beaches, temperatures } from './tempdata.js'
import { log, logTemp, getColor, getSymbol } from './utils.js'

const userSettings = async () => await settings.getUserSettings()

const RegionTypes = {
  County: { name: "County", plural: "Counties", localName: "Fylke" },
  Municipality: { name: "Municipality", plural: "Municipalities", localName: "Kommune" },
  Beach: { name: "Beach", plural: "Beaches", localName: "Strand" }
}

/**
 * Main menu actions and related functions with optional parameters
 */
const mainMenu = [
  { name: "🔎 Søk etter badeplass", action: searchForBeach },
  { name: "🗺  Velg fylke", action: chooseRegion, param: RegionTypes.County },
  { name: "📍 Velg kommune", action: chooseRegion, param: RegionTypes.Municipality },
  { name: "📈 Høyeste badetemperaturer i dag", action: getHighestTemperatures },
  // { name: "⚙️  Endre innstillinger", action: settings.changeSettings },
  { name: "❓ Hjelp", action: showHelpAndMenu },
  { name: "👋 Avslutt", action: quitApp }
]

/**
 * shows the main menu and parses the answer
 * optionally quits the app if the answer is quit or escape is pressed
 */
export function showMainMenu() {
  return showMenu(
    mainMenu,
    "Main Menu",
    `Velkommen til Badevann! 🏖\n${temperatures.length} oppdaterte badetemperaturer`
  )
}

/**
 * 
 * @param {*} choices List of choices to show (Array<{name: string, action: string, param?:string}>)
 * @param {*} title Title of the menu
 * @param {*} message Message shown in the top of the menu
 * @param {*} type default "list"
 * @returns the action callback of the chosen menu item 
 */
export function showMenu(choices, title, message, type = "list") {
  title && log(`Listing ${title}`)
  return inquirer.prompt([{
    type: type,
    name: "name",
    message: message,
    choices: choices,
    interruptedKeyname: 'escape'
  }])
    .then((answerObj) => {
      let answer = choices.find(choice => choice.name === answerObj.name)
      return answer && answer.action(answer.param)
    }, () => quitApp())
}

/**
 * 
 * @param {array<string>} beaches - array of beaches
 * @param {boolean} sortByTemp - sort by temperature
 */
function searchForBeach(beaches = temperatures, sortByTemp = false) {
  console.clear()
  beaches = sortByTemp
    ? beaches.sort((a, b) => b.temperature > a.temperature ? 1 : -1)
    : beaches.sort((a, b) => a.location.name > b.location.name ? 1 : -1)
  let beachNames = beaches.map(
    t => `${t.location.name}\u00a0${Array.from(" ".repeat(32 - t.location.name.length)).join('')} ${getSymbol(t.temperature)} ${getColor(t.temperature)}`)
  inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'name',
      pageSize: 20,
      message: 'Søk etter badeplass (esc for å gå tilbake til menyen)',
      interruptedKeyname: 'escape',
      source: (_, srch) => {
        return !srch ? beachNames
          : beachNames.filter(b => b.toLowerCase().indexOf(srch.toLowerCase()) > -1)
      },
    },
  ])
    .then((answer) => {
      answer.name = answer.name.split('\u00a0')[0]
      log(`Beach chosen: ${answer.name}`)
      let chosenBeach = temperatures.find(t => t.location.name === answer.name)
      console.clear()
      logTemp(chosenBeach)
    }, (err) => {
      console.clear()
      showMainMenu()
    })
}


/**
 * 
 * @param {*} regionType 
 * @returns a list of regions of the chosen RegionType, Country, Municipality or Beach
 */
function chooseRegion(regionType) {
  log(`Listing region type ${regionType.name}`)
  let regions = regionType == RegionTypes.County
    ? counties : regionType == RegionTypes.Municipality
      ? municipalities : beaches
  return inquirer.prompt([{
    type: "list",
    name: "name",
    message: `Velg ${regionType.localName}`,
    pageSize: 20,
    choices: regions,
    interruptedKeyname: 'escape'
  }]).then(regionChoice => {
    log(`Region choice: ${regionChoice.name}`)
    if (regionType == RegionTypes.Beach) {
      logTemp(temperatures.find(t => t.location.name === regionChoice.name))
    }
    else if (regionType == RegionTypes.County) {
      searchForBeach(temperatures.filter(t => t.location.region?.name === regionChoice.name))
    } else if (regionType == RegionTypes.Municipality) {
      searchForBeach(temperatures.filter(t => t.location.subregion?.name === regionChoice.name))
    }
  }, (err) => {
    log(`error:\n${err}`)
    console.clear()
    showMainMenu()
  })
}

/**
 * same as searchForBeach, but sorts by temperature, highest first
 */
function getHighestTemperatures() {
  searchForBeach(temperatures, true)
}

/**
 * shows help
 */
function showHelp() {
  console.log(`
    ${chalk.yellowBright('BADEVANN')}
    Denne konsollappen henter vanntemperaturer fra internett og lister ut resultatet i konsollen.\n
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
    `)
}

/**
 * show help, then returns to the main menu
 */
function showHelpAndMenu() {
  console.clear(); showHelp(); showMainMenu()
}

/**
 * shows help, then quits the app
 * used primarily when running the app with the -h flag
 */
export function showHelpAndExit() {
  console.clear(); showHelp(); process.exit(0)
}

function quitApp() {
  console.clear()
  console.log(chalk.cyanBright("\n\t  🔆 Hopp i havet! 🏖\n"))
  process.exit(0)
}