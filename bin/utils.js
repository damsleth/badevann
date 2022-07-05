import chalk from 'chalk'
import { getUserSettings } from './settings.js'
import { temperatures } from './tempdata.js'
import { showHelpAndExit } from './actions.js'

const slugify = (str) => str.toString().toLowerCase().trim()
const args = slugify(process.argv.slice(2).toString()).split(",")
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
export const isDebug = (hasArg('debug') || hasArg('d'))

export const userSettings = async () => await getUserSettings()

function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE;
}

export const settingsFileName = `${getUserHome()}/.badevann/settings.json`
export const cacheFileName = `${getUserHome()}/.badevann/cache.json`

export async function parseArgs() {
  if (!args[0].length) { log("No arguments given"); return }
  log("Parsing args")
  log(`Args: ${args}`)
  if (hasArg('help') || hasArg('?') || hasArg('h')) {
    log(`Help argument passed, showing help text and exiting`); return showHelpAndExit()
  } else if (hasArg('debug')) {
    log(`Running in debug mode`)
  }

  // not counting flags as beaches
  let beach = args.filter(a => !(
    a.indexOf('debug') > -1 ||
    a.indexOf('iso') > -1 ||
    a.indexOf('verbose') > -1 ||
    a.indexOf('short') > -1 ||
    a == '-d' ||
    a == '-i' ||
    a == '-v' ||
    a == '-s'))[0]
  if (!beach?.length) { return }

  // all other arguments, assuming it's a beach
  log(`Beach chosen: '${beach}'`)
  let loc = temperatures.find(t => t.location.name.toLowerCase() === beach)
  if (loc) {
    log(`Found ${loc.location.name}`)
    logTemp(loc)
    process.exit(0)
  } else {
    log(`Could not find '${beach}'`)
    log(`Trying a fuzzy search for '${beach}'`)
    let fuzzy = temperatures.filter(t => t.location.name.toLowerCase().indexOf(beach.toLowerCase()) > -1)
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

export function log(str) { isDebug && console.log(chalk.yellowBright(str)) }

export function logTemp(beach) {
  if (hasArg('short') || hasArg('s') || userSettings.outputFormat == 'short') {
    console.log(getColor(beach.temperature))
  } else if (hasArg('verbose') || hasArg('v') || hasArg('l') || userSettings.outputFormat == 'verbose') {
    console.log(`\n 🔆 ${beach.location.name.toUpperCase()} - ${beach.location.category.name}
Badetemperatur\t: ${getColor(beach.temperature)}
Måletidspunkt\t: ${new Date(beach.time).toLocaleDateString('nb-no')} ${new Date(beach.time).toLocaleTimeString('nb-no')}
Lokasjon\t: ${beach.location.urlPath}
Kart\t\t: https://google.com/maps?q=${beach.location.position.lat},${beach.location.position.lon}
${beach.sourceDisplayName ? `Kilde\t\t: ${beach.sourceDisplayName}` : ''}\n`)
  }
  else if (hasArg('iso') || hasArg('i') || userSettings.outputFormat == 'iso') {
    console.log(`${beach.location.name} ${new Date(beach.time).toISOString()}: ${getColor(beach.temperature)} `)
  }
  else {
    console.log(`${beach.location.name} ${new Date(beach.time).toLocaleDateString('nb-no')}: ${getColor(beach.temperature)} `)
  }
  log(JSON.stringify(beach, null, 2))
}

export function getColor(c) {
  log(`getting color temperature for temp ${c}`)
  function getColor(c) {
    switch (true) {
      case (c >= 26):
        return 'red'
      case (c >= 24 && c < 26):
        return 'yellow'
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

export function getSymbol(c) {
  log(`getting emoji for temp ${c}`)
  function getSymbol(c) {
    switch (true) {
      case (c >= 25):
        return '🥵'
      case (c >= 22 && c < 25):
        return '😎'
      case (c >= 20 && c < 22):
        return '😁'
      case (c >= 17 && c < 20):
        return '😊'
      case (c >= 15 && c < 17):
        return '😑'
      case (c >= 10 && c < 15):
        return '🥶'
      case (c < 10):
        return '⛄️'
      default:
        return '🔆'
    }
  }
  if (hasArg('nocolor')) return ""
  return getSymbol(c)
}