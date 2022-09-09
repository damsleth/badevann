import chalk from 'chalk'
import { temperatures } from './tempdata.js'
import * as settings from './settings.js'
import { showHelpAndExit } from './actions.js'

const slugify = (str) => str.toString().toLowerCase().trim()
const args = slugify(process.argv.slice(2).toString()).split(",")
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
export const isDebug = (hasArg('debug') || hasArg('d'))

const userHome = () => process.env.HOME || process.env.USERPROFILE
export const settingsFileName = `${userHome()}/.badevann/settings.json`
export const cacheFileName = `${userHome()}/.badevann/cache.json`

export function log(str) { isDebug && console.log(chalk.yellowBright(str)) }


// args override user settings
export async function parseArgs() {
  if (!args[0].length) { log("No arguments given"); return }
  log("Parsing args")
  log(`Args: ${args}`)
  if (hasArg('help') || hasArg('?') || hasArg('h')) {
    log(`Help argument passed, showing help text and exiting`)
    return showHelpAndExit()
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

  // All other arguments, assuming it's a beach
  log(`Beach chosen: '${beach}'`)
  let loc = temperatures.find(t => t.location.name.toLowerCase() === beach)
  if (loc) {
    log(`Found ${loc.location.name}`)
    logTemp(loc, settings.userSettings)
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
      logTemp(fuzzy[0], settings.userSettings)
      process.exit(0)
    } else {
      console.log(`Fant ikke badetemperatur for '${beach}'\n`)
    }
  }
}

function getShortTemp(beach) {
  return getColor(beach.temperature)
}

function getRegularTemp(beach) {
  return `${beach.location.name} ${new Date(beach.time).toLocaleDateString('nb-no')}: ${getColor(beach.temperature)} `
}

function getLongTemp(beach) {
  return `\n🔆 ${beach.location.name.toUpperCase()} \t${beach.location.category.name}
Badetemperatur\t: ${getColor(beach.temperature)}
Måletidspunkt\t: ${hasArg('iso') ? `${new Date(beach.time).toISOString()}` : `${new Date(beach.time).toLocaleDateString('nb-no')} ${new Date(beach.time).toLocaleTimeString('nb-no')}`}
Lokasjon\t: ${beach.location.urlPath}
Kart\t\t: https://google.com/maps?q=${beach.location.position.lat},${beach.location.position.lon}
${beach.sourceDisplayName ? `Kilde\t\t: ${beach.sourceDisplayName}` : ''}\n`
}

function getIsoTemp(beach) {
  return `${beach.location.name} ${new Date(beach.time).toISOString()}: ${getColor(beach.temperature)} `
}

export async function logTemp(beach, _userSettings) {
  let userSettings = _userSettings ? _userSettings : await settings.getUserSettings()
  log(`user settings: ${JSON.stringify(userSettings)}`)
  log(`outputformat: ${userSettings.outputFormat}`)

  if (hasArg('short') || hasArg('s') || userSettings.outputFormat == 'tempOnly') {
    console.log(getShortTemp(beach))
  } else if (hasArg('verbose') || hasArg('v') || hasArg('l') || userSettings.outputFormat == 'long') {
    console.log(getLongTemp(beach))
  }
  else if (hasArg('iso') || hasArg('i') || userSettings.outputFormat == 'iso') {
    console.log(getIsoTemp(beach))
  }
  else {
    console.log(getRegularTemp(beach))
  }
  log(JSON.stringify(beach, null, 2))
}

export function getColor(c) {
  function getColor(c) {
    switch (true) {
      case (c >= 25):
        return 'red'
      case (c >= 22 && c < 25):
        return 'yellow'
      case (c >= 17 && c < 22):
        return 'green'
      case (c >= 15 && c < 17):
        return 'cyan'
      case (c < 15):
        return 'blue'
      default:
        return 'white'
    }
  }
  if (hasArg('nocolor')) return `${c}°C`
  let color = getColor(c)
  return chalk[color](c + '°C')
}

export function getSymbol(c) {
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