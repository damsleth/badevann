# 🏝 BADEVANN 🏊‍♂️

A CLI tool that fetches and displays water temperatures from beaches in Norway.

## Installation 💾

Use the `npm` command line tool that comes with [node.js](https://nodejs.org/)  
Minimum required node version is **14**

Run the following from your terminal:  
```bash
# Install globally
npm i -g badevann

# Or run directly from the repository
npm install
npm start
```

## Usage 💻

`badevann` lets you browse beaches by county or municipality, search for beaches, and check today's highest water temperatures.  
Alternatively, you can type `badevann <beach>` to fetch the temperature for `<beach>` directly.

## Command Line Arguments ⌨️

- `h` or `help`: Display help text and exit
- `v` or `verbose`: Show detailed beach information
- `i` or `iso`: Show timestamps in ISO 8601 format
- `s` or `short`: Show only temperature
- `nocolor`: Display temperature without color (<20°C is blue, 20-25°C is green, and >25°C is red)
- `d` or `debug`: Show debug information during use

### Examples

- `badevann short`: Show the main menu, and when you select a beach, only the temperature is displayed
- `badevann storøyodden s`: Get water temperature from Storøyodden, show only temperature
- `badevann kalvøya v`: Get water temperature from Kalvøya, show detailed information about the beach
- `badevann sørenga iso`: Get water temperature from Sørenga in ISO 8601 format

## Features

- Interactive CLI with search and selection menus
- Data caching to minimize API calls
- Color-coded temperature display
- Multiple output formats (short, long, ISO)
- Customizable user settings

## Project Structure

The application is organized as follows:

```
badevann/
├── bin/             # CLI entry point
├── src/
│   ├── core/        # Core application logic
│   ├── services/    # Data services and API integration
│   ├── ui/          # User interface components
│   └── utils/       # Utility functions and helpers
└── package.json
```

## Powerlevel10k Integration

If you're running [zsh](https://www.zsh.org/) (standard shell on macOS) with [powerlevel10k](https://github.com/romkatv/powerlevel10k), you can get **water temperature from your favorite beach as a prompt element**:

1. Add the `badevann` call as a variable in `~/.zshrc`, e.g.:  
   ```
   temp="$(badevann storøyodden s)"
   ```  
   (remember the s parameter to only get the temperature).
   
2. Open `~/.p10k.zsh`, and create a function called `prompt_bathing_temp`, like this:  
   ```
   function prompt_bathing_temp() {
     p10k segment -b cyan -f black -i '🌡' -t $temp
   }
   ```
   
3. Add `bathing_temp` as a line under `typeset -g POWERLEVEL9K_LEFT_PROMPT_ELEMENTS`.  
   This refers to the `prompt_bathing_temp` function.
   
4. Save `~/.p10k.zsh` and `~/.zshrc`, and restart your terminal.

5. Now the water temperature will be displayed in your shell prompt.

## Data Source 💽

All data comes primarily from YR.no.  
If you encounter issues with the app, check the website or log an issue on [GitHub](https://github.com/damsleth/badevann/issues).

## License 🤷‍♂️

### [WTFPL](http://www.wtfpl.net/)