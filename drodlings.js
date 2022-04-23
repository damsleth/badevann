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