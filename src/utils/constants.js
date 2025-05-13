/**
 * Constants and configuration values used throughout the application
 */

// Path configuration
const userHome = () => process.env.HOME || process.env.USERPROFILE
export const SETTINGS_FILE_PATH = `${userHome()}/.badevann/settings.json`
export const CACHE_FILE_PATH = `${userHome()}/.badevann/cache.json`

// API configuration
export const API_ENDPOINT = "https://www.yr.no/api/v0/regions/NO/watertemperatures"
export const DEFAULT_CACHE_TIMEOUT = 1000 * 60 * 60 // 1 hour in milliseconds

// Temperature thresholds for color and emoji display
export const TEMP_THRESHOLDS = {
  HOT: 25,
  WARM: 22,
  PLEASANT: 20,
  COMFORTABLE: 17,
  COOL: 15,
  COLD: 10
}

// Region types for menu organization
export const REGION_TYPES = {
  COUNTY: { name: "County", plural: "Counties", localName: "Fylke" },
  MUNICIPALITY: { name: "Municipality", plural: "Municipalities", localName: "Kommune" },
  BEACH: { name: "Beach", plural: "Beaches", localName: "Strand" }
}