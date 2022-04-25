  // regions.some(region => args.some(arg => {
  //   // region.id.substring(3) is e.g. 42 for "Agder"
  //   if (arg === slugify(region.name) || arg === region.id.substring(3)) {
  //     log(`arg ${arg} matches station ${region.name}, parsing...`)
  //     parseAnswer([region.value]); return true
  //   }
  // })) || regionPicker()

  // inquirer, prompting for a station, using stations declared above
  // function regionPicker() {
  //   log(`Listing Regionpicker`)
  //   inquirer.prompt([{ type: "list", name: "Velg region", choices: counties }])
  //     .then((regionChoice) => parseAnswer(regionChoice))
  // }


  //   // parse the station name from inquirer or passed argument
  //   function parseAnswer(stationObj) {
  //     let stationName = Object.values(stationObj)
  //     let url = `${domain}${slugify(stationName)}${suffix}`
  //     log(`fetching url ${url}`)
  //     fetch({ url: url, responseType: 'text', method: 'get' })
  //       .then(res => {
  //         // we have to massage the data a little before parsing, since it's prefixed with a 'var m2021= [...]' and suffixed with '];'
  //         let stripped = res.data.substr(12).substr(0, res.data.length - 14)
  //         // parsing
  //         let vals = JSON.parse(stripped)
  //         // last entry
  //         // future feature: fetch value from specific date
  //         const latest = vals[vals.length - 1]
  
  //         // the array of arrays contain an isostring and a human readable string
  //         // NB THE ISOSTRING IS WRONG FROM THE SERVER, SHOWING YEAR '2000'
  //         // thus the hack below
  //         let timeISO = latest[0]
  //         let isoDate = new Date(timeISO)
  //         isoDate.setFullYear(new Date().getFullYear())
  //         timeISO = isoDate.toISOString().substr(0, timeISO.indexOf(':') + 3)
  //         // end hack
  
  //         // the actual temperature, as a float
  //         const celcius = latest[1]
  //         // human readable time
  //         const time = latest[2]
  //         // long form
  //         if (hasArg('long') || hasArg('time')) {
  //           console.log(`Vanntemperatur ${hasArg('nocolor') ? stationName : chalk.yellow(stationName)}, ${hasArg('iso') ? timeISO : time}\n${temp(celcius)}`)
  //         } else if (hasArg('iso')) {
  //           console.log(`${temp(celcius)}\t${timeISO}`)
  //         } else {
  //           console.log(`${temp(celcius)}`)
  //         }
  //         process.exit(0)
  //       }).catch((error) => {
  //         // error handling
  //         if (hasArg('debug')) {
  //           if (error.response) {
  //             // request made, server responded
  //             console.log(error.response.data)
  //             console.log(error.response.status)
  //             console.log(error.response.headers)
  //           } else if (error.request) {
  //             // request made but no response received
  //             console.log(error.request)
  //             if (error.request._currentRequest.socket._hadError) {
  //               console.log(`\n${chalk.bgRed("Error in socket, probably you're offline")}`)
  //             }
  //           } else {
  //             // something happened in setting up the request that triggered an Error
  //             console.log('Error', error.message)
  //           }
  //         }
  //         else {
  //           console.log(chalk.bgRed(`
  // FEIL: Noe gikk galt ved uthenting av vanntemperaturen
  // Sjekk internettforbindelsen, eller prøv igjen med 'debug' parameteren for mer detaljer\n`))
  //         }
  //         process.exit(1)
  //       })
  //   }