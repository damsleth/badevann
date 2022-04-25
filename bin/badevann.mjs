#! /usr/bin/env node --no-warnings --experimental-modules
// the above is for declaring the runtime, i.e node, and suppressing the ESM modules warning (not needed in node >=14)

import inquirer from 'inquirer'
import chalk from 'chalk'

// todo DRY up fetching of regions/counties/beaches

//TODO GET ALL WATER TEMPS, IMPLEMENT SEARCH (AS YOU TYPE)
// https://www.yr.no/api/v0/regions/NO/watertemperatures


const RegionTypes = {
  County: { name: "County", plural: "Counties", localName: "Fylke" },
  Municipality: { name: "Municipality", plural: "Municipalities", localName: "Kommune" },
  Beach: { name: "Beach", plural: "Beaches", localName: "Strand" }
}

// api root url
const apiRoot = "https://www.yr.no/api/v0/regions/"
// lowercase stuff, to make everything easier
const slugify = (str) => str.toString().toLowerCase()
// slugify all params first
const args = slugify(process.argv.slice(2).toString()).split(",")
// convenience method for checking if a string contains one of the passed args
// stripping away dashes, since some use them, some don't - doesn't matter here
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
// logging if 'debug' parameter is passed
const log = (str) => { hasArg('debug') && console.log(str) }
// todo loglevel, i.e. verbose, silly


log(`App started`)
try {

  // show help and exit
  if (hasArg('help') || hasArg('?') || hasArg('h')) {
    log(`Help argument passed, showing help text and exiting`)
    showHelpAndExit()
  }
  log(`ARGS: ${args}`)

  // todo caching so yr.no won't hate us
  // todo accept param, so we can pass a county id and fetch the it
  // e.g. region can be 30 (viken), or or 30-3024 (bærum), or 
  // if region id is passed, parse it here and skip the necessary amount of pickers
  // e.g. if id is 30, skip county picker and jump to the municipality picker
  // or if the id is 30-3024, skip county picker and municipality picker and jump to the beach picker

  const counties = await fetchRegion(RegionTypes.County, 'NO')
  if (!counties) throw new Error('Could not fetch regions')

  let chosenCounty = await chooseRegion(RegionTypes.County, counties)
  log(`Chose county '${chosenCounty.name}'`)
  log(chosenCounty)

  let municipalities = await fetchRegion(RegionTypes.Municipality, chosenCounty.id)
  if (!municipalities) throw new Error('Could not fetch municipalities')

  let chosenMunicipality = await chooseRegion(RegionTypes.Municipality, municipalities)
  log(`Chose municipality '${chosenMunicipality.name}'`)
  log(chosenMunicipality)

  let beaches = await fetchRegion(RegionTypes.Beach, chosenMunicipality.id)
  if (!beaches) throw new Error('Could not fetch beaches')

  let chosenBeach = await chooseRegion(RegionTypes.Beach, beaches)
  log(`Chose beach: '${chosenBeach.location.name}'`)
  log(chosenBeach)
  console.log(`${temp(chosenBeach.temperature)}`)

  // fetching county, municipality or beach
  async function fetchRegion(regionType, url) {
    // todo accept param instead of choosing from list
    log(`Fetching ${regionType.plural}`)
    url = regionType === RegionTypes.Beach ? `${url}/watertemperatures` : url
    let choices = await fetch(`${apiRoot}${url}`).then(res => res.json().then(d => d.regions ? d.regions : d))
    log(`${choices.length} ${regionType.plural} retrieved`)
    return choices
  }

  // display choices for currently fetched counties, municipalities or beaches
  async function chooseRegion(regionType, regions) {
    log(`Listing ${regionType.plural} picker`)
    return inquirer.prompt([{
      type: "list",
      pageSize: 17,
      name: "name",
      message: regionType.localName,
      choices: (
        regionType == RegionTypes.Beach
          ? regions.map(r => r.location.name)
          : regions)
    }])
      .then((regionChoice) => regions.find(r => r.name
        ? r.name === regionChoice.name
        : r.location.name === regionChoice.name))
  }

  function showHelpAndExit() {
    console.log(`
${chalk.yellowBright('BADEVANN')}\nDenne konsollappen henter vanntemperaturer fra internett og lister ut resultatet i konsollen.\n
${chalk.yellowBright('BRUK')}\n'badevann' lar deg velge badeplass fra en liste.
Alternativt kan du skrive 'badevann <badeplass>', så henter den ut temperaturer for <badeplass> ELLER
Skrive 'badevann <nummer>' for å hente temperaturer fra badeplassen som matcher nummeret

${chalk.yellowBright('PARAMETRE')}:
help: vis denne teksten
debug: vis utfyllende info ved bruk
nocolor: ikke fargelegg temperaturen (<20 er blå, 20-25 er grønn og >25 er rød)
long: vis dato for måleravlesning sammen med vanntemperatur
iso : vis tidspunkt for måleravlesning på ISO 8601-format

${chalk.yellowBright('OM DATAENE')}:
Dataene kommer primært fra yr.no Ved feil i appen, sjekk nettsiden eller lag et issue på github.
Denne appen er skrevet av @damsleth <https://github.com/damsleth>
`)
    process.exit(0)
  }
} catch (err) {
  console.log(err)
  console.log("ERROR HIT! quitting")
}


//#region helper functions

function temp(c) {
  log(`getting color temperature for temp ${c}`)
  function getColor(c) {
    switch (true) {
      case (c >= 25):
        return 'orange'
      case (c >= 20 && c < 25):
        return 'green'
      case (c >= 15 && c < 20):
        return 'cyan'
      case (c < 15):
        return 'blue'
      default:
        return 'white'
    }
  }
  if (hasArg('nocolor')) return `${c}°C`
  let color = getColor(c)
  log(`color temperature is ${color}`)
  return chalk[color](c + '°C')
}

//#endregion