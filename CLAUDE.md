# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Badevann is a CLI tool that fetches and displays water temperatures from beaches in Norway. The app provides users with various ways to search for beaches (by county, municipality, or name) and displays water temperatures with color coding based on temperature ranges.

## Commands

### Installation
```bash
npm install
```

### Running the Application
```bash
# Run directly from source
node bin/badevann.mjs

# Run the installed CLI tool
badevann
```

## Code Architecture

The application is built as a Node.js CLI tool with an ESM module structure and consists of several key files:

- `bin/badevann.mjs`: Main entry point that initializes the app and shows the main menu
- `bin/actions.js`: Contains the menu system and application actions
- `bin/tempdata.js`: Handles data fetching from YR.no API and caching
- `bin/utils.js`: Utility functions for argument parsing, logging, and temperature display
- `bin/settings.js`: User settings management

### Data Flow

1. The app fetches water temperature data from YR.no API
2. Data is cached locally (~/.badevann/cache.json) to reduce API calls
3. User can browse beaches by county, municipality, or search directly
4. Temperature display is customizable with various formatting options

### Key Features

- Interactive CLI with search and selection menus
- Data caching to minimize API calls
- Color-coded temperature display
- Multiple output formats (short, long, ISO)
- Customizable user settings

## Configuration

User settings are stored in `~/.badevann/settings.json` and include:
- Output format (short, long, ISO)
- Default beach
- Number of beaches to display at once
- Cache timeout
- Debug mode toggle

## Command Line Arguments

The app supports several command line arguments:
- `help|h`: Display help text
- `verbose|v`: Show detailed beach information
- `iso|i`: Show timestamps in ISO 8601 format
- `short|s`: Show only temperature
- `nocolor`: Display temperature without color
- `debug|d`: Run in debug mode

## Development Notes

- The project uses Node.js ESM modules
- The app is designed to work with Node.js 12+ (currently requires Node.js 22 per .nvmrc)
- All data is fetched from YR.no's API and cached locally