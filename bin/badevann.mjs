#! /usr/bin/env node --no-warnings --experimental-modules
// the above is for declaring the runtime, i.e node, and suppressing the ESM modules warning (not needed in node >=14)

// This is just a wrapper that imports the main app from the src directory
import '../src/index.js'