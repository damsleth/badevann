#! /usr/bin/env node --no-warnings --experimental-modules
// the above is for declaring the runtime, i.e node, and suppressing the ESM modules warning (not needed in node >=14)

import inquirer from 'inquirer'
import * as settings from './settings.js'
import { showMainMenu } from './actions.js'
import { log, isDebug, parseArgs } from './utils.js'
import autocompletePrompt from 'inquirer-autocomplete-prompt'
import InterruptedPrompt from 'inquirer-interrupted-prompt'
InterruptedPrompt.replaceAllDefaults(inquirer)
inquirer.registerPrompt('autocomplete', InterruptedPrompt.from(autocompletePrompt))

const userSettings = await settings.getSettings()

log("Showing menu")
try {
  !isDebug && console.clear()
  parseArgs()
  showMainMenu()
} catch (err) {
  log(err)
  console.log("ERROR! quitting")
}

