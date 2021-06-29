#! /usr/bin/env node --experimental-modules --no-warnings
// the above is for declaring the runtime, i.e node, and suppressing the ESM modules warning (not needed in node >=14)

import inquirer from 'inquirer'
import axios from 'axios'
import chalk from 'chalk'

// remove ø from station names and lowercase them, for use in urls
const slugify = (str) => str.toString().toLowerCase().replace(/ø/g, 'o')
// slugify all params first
const args = slugify(process.argv.slice(2).toString()).split(",")
// convenience method for checking if a string contains one of the passed args
// stripping away dashes, since some use them, some don't - doesn't matter here
const hasArg = (str) => [].slice.call(args).some(a => a.replace(/\-/g, '') === slugify(str))
// logging if 'debug' parameter is passed
const log = (str) => { hasArg('debug') && console.log(str) }
log(`App started`)
// where we're fetching the data
const domain = "http://badevann.no/"
// where on the server the data is stored
const suffix = `/flere_sesonger/m${new Date().getFullYear().toString().substr(2, 2)}.js`
// show help
if (hasArg('help') || hasArg('?') || hasArg('h')) {
    log(`Help argument passed, showing help text and exiting`)
    showHelpAndExit()
}

// we could populate these dynamically, but it's easier to keep them here, extending with custom params etc.
const stations = [
    { name: "Kalvøya, Bærum (1)", value: "Kalvøya", key: 1 },
    { name: "Storøyodden, Bærum (2)", value: "Storøyodden", key: 2 },
    { name: "Hvalstrand, Asker (3)", value: "Hvalstrand", key: 3 },
    { name: "Helleneset, Bergen (4)", value: "Helleneset", key: 4 },
    { name: "Kruseter, Halden (5)", value: "Kruseter", key: 5 },
    { name: "Svalerødkilen, Halden (6)", value: "Svalerødkilen", key: 6 },
]

log(`ARGS: ${args}`)

// test if any of the passed args match the value or key of any of the stations
// and if so, parse the answer
// if not, trigger the station picker
stations.some(station => args.some(arg => {
    if (arg === slugify(station.value) || parseFloat(arg) === station.key) {
        log(`arg ${arg} matches station ${station.value}, parsing...`)
        parseAnswer([station.value]); return true
    }
})) || stationPicker()

// inquirer, prompting for a station, using stations declared above
function stationPicker() {
    log(`Listing stations`)
    inquirer.prompt([{ type: "list", name: "Velg målestasjon", choices: stations }]).then((stationChoice) => parseAnswer(stationChoice))
}

// parse the station name from inquirer or passed argument
function parseAnswer(stationObj) {
    let stationName = Object.values(stationObj)
    let url = `${domain}${slugify(stationName)}${suffix}`
    log(`fetching url ${url}`)
    axios({ url: url, responseType: 'text', method: 'get' })
        .then(res => {
            // we have to massage the data a little before parsing, since it's prefixed with a 'var m2021= [...]' and suffixed with '];'
            let stripped = res.data.substr(12).substr(0, res.data.length - 14)
            // parsing
            let vals = JSON.parse(stripped)
            // last entry
            // future feature: fetch value from specific date
            const latest = vals[vals.length - 1]

            // the array of arrays contain an isostring and a human readable string
            // NB THE ISOSTRING IS WRONG FROM THE SERVER, SHOWING YEAR '2000'
            // thus the hack below
            let timeISO = latest[0]
            let isoDate = new Date(timeISO)
            isoDate.setFullYear(new Date().getFullYear())
            timeISO = isoDate.toISOString().substr(0, timeISO.indexOf(':') + 3)
            // end hack

            // the actual temperature, as a float
            const celcius = latest[1]
            // human readable time
            const time = latest[2]
            // long form
            if (hasArg('long') || hasArg('time')) {
                console.log(`Vanntemperatur ${hasArg('nocolor') ? stationName : chalk.yellow(stationName)}, ${hasArg('iso') ? timeISO : time}\n${temp(celcius)}`)
            } else if (hasArg('iso')) {
                console.log(`${temp(celcius)}\t${timeISO}`)
            } else {
                console.log(`${temp(celcius)}`)
            }
            process.exit(0)
        }).catch((error) => {
            // error handling
            if (hasArg('debug')) {
                if (error.response) {
                    // request made, server responded
                    console.log(error.response.data)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                } else if (error.request) {
                    // request made but no response received
                    console.log(error.request)
                    if (error.request._currentRequest.socket._hadError) {
                        console.log(`\n${chalk.bgRed("Error in socket, probably you're offline")}`)
                    }
                } else {
                    // something happened in setting up the request that triggered an Error
                    console.log('Error', error.message)
                }
            }
            else {
                console.log(chalk.bgRed(`
FEIL: Noe gikk galt ved uthenting av vanntemperaturen
Sjekk internettforbindelsen, badevann.no, eller prøv igjen med 'debug' parameteren for mer detaljer\n`))
            }
            process.exit(1)
        })
}

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

function showHelpAndExit() {
    console.log(`
${chalk.yellowBright('BADEVANN')}\nDenne konsollappen henter vanntemperaturer fra badevann.no og lister ut resultatet i konsollen.\n
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
Dataene kommer fra badevann.no. Ved feil i appen, sjekk nettsiden.
Denne appen er skrevet av @damsleth <https://github.com/damsleth>
`)
    process.exit(0)
}