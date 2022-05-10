#! /usr/bin/env node --no-warnings --experimental-modules
// the above is for declaring the runtime, i.e node, and suppressing the ESM modules warning (not needed in node >=14)
import { promises as fs } from 'fs'
import settings from './settings.js'
import inquirer from 'inquirer'
import chalk from 'chalk'
import autocompletePrompt from 'inquirer-autocomplete-prompt'
import InterruptedPrompt from 'inquirer-interrupted-prompt'
InterruptedPrompt.replaceAllDefaults(inquirer)
inquirer.registerPrompt('autocomplete', InterruptedPrompt.from(autocompletePrompt))

// TODO
/*
User settings:
  default output: menu(default), short (temp only), normal (Name, date, temp), verbose (Name, date, temp, location, region, subregion)
  default beach: none(default)
  beaches listed: 10, 20(default), 50, 100
  cache timeout: 8h(default), custom
*/

const RegionTypes = {
  County: { name: "County", plural: "Counties", localName: "Fylke" },
  Municipality: { name: "Municipality", plural: "Municipalities", localName: "Kommune" },
  Beach: { name: "Beach", plural: "Beaches", localName: "Strand" }
}

const userSettings = await settings.getSettings()

const menu = [
  { name: "🔎 Søk etter badeplass", action: searchForBeach },
  { name: "🗺  Velg fylke", action: chooseRegion, param: RegionTypes.County },
  { name: "📍 Velg kommune", action: chooseRegion, param: RegionTypes.Municipality },
  { name: "📈  Høyeste badetemperaturer i dag", action: getHighestTemperatures },
  { name: "⚙️  Endre innstillinger", action: getHighestTemperatures },
  { name: "❓ Hjelp", action: showHelpAndMenu },
  { name: "👋 Avslutt", action: quitApp }
]

const apiEndpoint = "https://www.yr.no/api/v0/regions/NO/watertemperatures"
const slugify = (str) => str.toString().toLowerCase().trim()
const args = slugify(process.argv.slice(2).toString()).split(",")
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
const isDebug = (hasArg('debug') || hasArg('d'))
const log = (str) => { isDebug && console.log(chalk.yellowBright(str)) }
const allTemps = await getTemperatures()
const counties = [], municipalities = [], beaches = []

if (!allTemps) { throw new Error('Could not fetch water temperatures') }
allTemps.forEach(temp => {
  counties.indexOf(temp.location.region?.name) === -1 && counties.push(temp.location.region?.name)
  municipalities.indexOf(temp.location.subregion?.name) === -1 && municipalities.push(temp.location.subregion?.name)
  beaches.indexOf(temp.location.name) === -1 && beaches.push(temp.location.name)
})

counties.sort()
municipalities.sort()
beaches.sort()

log("Showing menu")
try {
  !isDebug && console.clear()
  parseArgs()
  showMenu()
} catch (err) {
  log(err)
  console.log("ERROR! quitting")
}

function showMenu() {
  chooseMenu(menu).then(answer => { answer && answer.action(answer.param) })
}

function chooseMenu(menuChoices) {
  log(`Listing menu`)
  return inquirer.prompt([{
    type: "list",
    name: "name",
    message: `Velkommen til Badevann! 🏖  med (${allTemps.length}) oppdaterte badetemperaturer`,
    choices: menuChoices
  }])
    .then((menuChoice) => menuChoices.find(m => m.name === menuChoice.name), () => quitApp())
}

function getHighestTemperatures() {
  searchForBeach(allTemps, true)
}

function searchForBeach(beaches = allTemps, sortByTemp = false) {
  console.clear()
  beaches = sortByTemp
    ? beaches.sort((a, b) => b.temperature > a.temperature ? 1 : -1)
    : beaches.sort((a, b) => a.location.name > b.location.name ? 1 : -1)
  let beachNames = beaches.map(
    t => `${t.location.name}\u00a0${Array.from(" ".repeat(32 - t.location.name.length)).join('')} ${temp(t.temperature)}`)
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
      let chosenBeach = allTemps.find(t => t.location.name === answer.name)
      console.clear()
      logTemp(chosenBeach)
    }, (err) => {
      console.clear()
      showMenu()
    })
}

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
      logTemp(allTemps.find(t => t.location.name === regionChoice.name))
    }
    else if (regionType == RegionTypes.County) {
      searchForBeach(allTemps.filter(t => t.location.region?.name === regionChoice.name))
    } else if (regionType == RegionTypes.Municipality) {
      searchForBeach(allTemps.filter(t => t.location.subregion?.name === regionChoice.name))
    }
  }, (err) => {
    log(`error:\n${err}`)
    console.clear()
    showMenu()
  })
}

function parseArgs() {
  if (!args[0].length) { return }
  log("Parsing args")
  log(`Args: ${args}`)
  if (hasArg('help') || hasArg('?') || hasArg('h')) {
    log(`Help argument passed, showing help text and exiting`)
    return showHelpAndExit()
  } else if (hasArg('debug')) {
    log(`Running in debug mode`)
  }
  let beach = args.filter(a => !(
    a.indexOf('debug') > -1 ||
    a.indexOf('verbose') > -1 ||
    a == 'v' ||
    a == '-v' ||
    a == '-d' ||
    a == 'd'))[0]
  if (!beach?.length) { return }

  // all other arguments, assuming it's a beach
  log(`Beach chosen: ${beach}`)
  let loc = allTemps.find(t => t.location.name.toLowerCase() === beach)
  if (loc) {
    log(`Found ${loc.location.name}`)
    logTemp(loc)
    process.exit(0)
  } else {
    log(`Could not find '${beach}'`)
    log(`Trying a fuzzy search for '${beach}'`)
    let fuzzy = allTemps.filter(t => t.location.name.toLowerCase().indexOf(beach.toLowerCase()) > -1)
    if (fuzzy.length > 0) {
      if (fuzzy.length > 1) {
        log(`Found ${fuzzy.length} matches,\nGrabbing the first one, which is '${fuzzy[0].location.name}'`)
      }
      else { log(`Found ${fuzzy.length} match, '${fuzzy[0].location.name}'`) }
      logTemp(fuzzy[0])
      process.exit(0)
    } else {
      console.log(`Fant ikke badetemperatur for '${beach}'\n`)
    }
  }
}

async function getTemperatures() {
  log("Getting temperatures")
  const caching_timeout = 1000 * 60 * 60 * 24 // 24 hours
  try {
    const cache_file = await fs.readFile('./cache.json', 'utf8')
    if (cache_file) {
      log(`cache_file.length: ${cache_file.length}`)
      let cache = JSON.parse(cache_file)
      if (cache.timestamp + caching_timeout < Date.now()) {
        log('Cache is fresh')
        log(cache.data)
        return cache.data
      }
    } else {
      log('Cache file timed out - Fetching fresh data')
      return await getFreshData()
    }
  } catch (err) {
    log("No cache file found, fetching fresh data")
    return await getFreshData()
  }
  async function getFreshData() {
    const tempData = await fetch(apiEndpoint).then(r => r.json().then(d => d))
    log('Fetched fresh data')
    await fs.writeFile('./cache.json', JSON.stringify({ timestamp: Date.now(), data: tempData }))
    return tempData
  }
}

function logTemp(beach) {
  if (hasArg('short') || hasArg('s')) {
    console.log(temp(beach.temperature))
  } else if (hasArg('verbose') || hasArg('v') || hasArg('l')) {
    console.log(`\n☀️  ${beach.location.name.toUpperCase()} - ${beach.location.category.name}
Badetemperatur\t: ${temp(beach.temperature)}
Måletidspunkt\t: ${new Date(beach.time).toLocaleDateString('nb-no')} ${new Date(beach.time).toLocaleTimeString('nb-no')}
Lokasjon\t: ${beach.location.urlPath}
Kart\t\t: https://google.com/maps?q=${beach.location.position.lat},${beach.location.position.lon}
${beach.sourceDisplayName ? `Kilde\t\t: ${beach.sourceDisplayName}` : ''}\n`)
  }
  else if (hasArg('iso')) {
    console.log(`${beach.location.name} ${new Date(beach.time).toISOString()}: ${temp(beach.temperature)} `)
  }
  else {
    console.log(`${beach.location.name} ${new Date(beach.time).toLocaleDateString('nb-no')}: ${temp(beach.temperature)} `)
  }
  log(JSON.stringify(beach, null, 2))
}

function getDate(date) {

}

function temp(c) {
  log(`getting color temperature for temp ${c}`)
  function getColor(c) {
    switch (true) {
      case (c >= 26):
        return 'red'
      case (c >= 24 && c < 26):
        return 'orange'
      case (c >= 19 && c < 24):
        return 'green'
      case (c >= 14 && c < 19):
        return 'cyan'
      case (c < 15):
        return 'blue'
      default:
        return 'white'
    }
  }
  if (hasArg('nocolor')) return `${c}°C`
  let color = getColor(c)
  log(`color temperature is ${color} `)
  return chalk[color](c + '°C')
}

function showHelp() {
  console.log(`
    ${chalk.yellowBright('BADEVANN')}
    Denne konsollappen henter vanntemperaturer fra internett og lister ut resultatet i konsollen.\n
    ${chalk.yellowBright('BRUK')}
    'badevann' lar deg velge badeplass fra en liste.
    Alternativt kan du skrive 'badevann <badeplass>', så henter den ut temperaturer for <badeplass>

    ${chalk.yellowBright('PARAMETRE')}:
    help | h: vis denne teksten
    short | s: vis bare vanntemperatur
    verbose | v: vis mer utfyllende info om badeplassen sammen med vanntemperaturen
    nocolor: ikke fargelegg temperaturen (<20 er blå, 20-25 er grønn og >25 er rød)
    debug | d : vis utfyllende info ved bruk
    iso : vis tidspunkt for måleravlesning på ISO 8601-format

    ${chalk.yellowBright('OM DATAENE')}:
    Dataene kommer primært fra yr.no Ved feil i appen, sjekk nettsiden eller lag et issue på github.
    Denne appen er skrevet av @damsleth <https://github.com/damsleth>
    `)
}

function showHelpAndMenu() {
  console.clear()
  showHelp()
  showMenu()
}

function showHelpAndExit() {
  console.clear()
  showHelp()
  process.exit(0)
}

function quitApp() {
  console.clear()
  console.log(chalk.cyanBright("\n\t☀️  Hopp i havet! 🏖\n"))
  process.exit(0)
}