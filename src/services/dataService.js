/**
 * Data service for fetching and managing temperature data
 */
import fetch from 'node-fetch';
import pkg from 'fs-extra';
import { CACHE_FILE_PATH, API_ENDPOINT } from '../utils/constants.js';
import * as logger from '../utils/logger.js';
import * as config from '../core/config.js';

const { outputJson, readFile, stat } = pkg;

// Cache for temperature data
let temperatureData = {
  timestamp: 0,
  beaches: [],
  counties: [],
  municipalities: [],
  temperatures: []
};

/**
 * Get temperature data, either from cache or fresh from API
 * @return {Promise<object>} The temperature data object
 */
export async function getTemperatureData() {
  logger.debug("Getting temperature data");
  
  try {
    const settings = config.getSettings();
    const cacheTimeout = settings.cacheTimeout * 60 * 1000; // Convert minutes to milliseconds
    
    // If cache timeout is 0, always fetch fresh data
    if (settings.cacheTimeout === 0) {
      return await fetchFreshData();
    }
    
    // Try to read from cache first
    logger.debug(`Trying to read from ${CACHE_FILE_PATH}`);
    const cacheFile = await readFile(CACHE_FILE_PATH, { encoding: 'utf8' });
    
    if (cacheFile) {
      logger.debug("Cache file found");
      const cacheFileSize = (await stat(CACHE_FILE_PATH)).size;
      logger.debug(`Cache size: ${Math.round(cacheFileSize / 1000)} KB`);
      
      const cache = JSON.parse(cacheFile);
      const now = new Date().getTime();
      const cacheAge = now - cache.Timestamp;
      const cacheFresh = cacheAge < cacheTimeout;
      
      logger.debug(`Cache age: ${(cacheAge / 1000 / 60).toFixed(1)} min`);
      
      if (cacheFresh) {
        logger.debug('Cache is fresh');
        
        // Update the internal cache
        temperatureData = {
          timestamp: cache.Timestamp,
          beaches: cache.Beaches,
          counties: cache.Counties,
          municipalities: cache.Municipalities,
          temperatures: cache.Data
        };
        
        return temperatureData;
      } else {
        logger.debug('Cache is stale, fetching fresh data');
        return await fetchFreshData();
      }
    } else {
      throw new Error("Cache file not found");
    }
  } catch (err) {
    logger.debug(`Cache error: ${err.message}`);
    return await fetchFreshData();
  }
}

/**
 * Fetch fresh data from the API
 * @return {Promise<object>} The temperature data object
 */
async function fetchFreshData() {
  try {
    logger.debug(`Fetching from ${API_ENDPOINT}`);
    const response = await fetch(API_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const tempData = await response.json();
    logger.debug('Fetched fresh data');

    // Extract unique counties, municipalities, and beaches
    const counties = [], municipalities = [], beaches = [];
    
    tempData.forEach(temp => {
      if (temp.location.region?.name && counties.indexOf(temp.location.region.name) === -1) {
        counties.push(temp.location.region.name);
      }
      
      if (temp.location.subregion?.name && municipalities.indexOf(temp.location.subregion.name) === -1) {
        municipalities.push(temp.location.subregion.name);
      }
      
      if (beaches.indexOf(temp.location.name) === -1) {
        beaches.push(temp.location.name);
      }
    });

    // Sort the lists
    counties.sort();
    municipalities.sort();
    beaches.sort();

    // Update beach choices for settings
    config.updateBeachChoices(beaches);

    // Create the data object
    const data = {
      Timestamp: new Date().getTime(),
      Data: tempData,
      Counties: counties,
      Municipalities: municipalities,
      Beaches: beaches
    };

    // Save to cache file
    await outputJson(CACHE_FILE_PATH, data);
    
    // Update the internal cache
    temperatureData = {
      timestamp: data.Timestamp,
      beaches: data.Beaches,
      counties: data.Counties,
      municipalities: data.Municipalities,
      temperatures: data.Data
    };
    
    return temperatureData;
  } catch (err) {
    logger.error(`Failed to fetch data: ${err.message}`);
    throw err;
  }
}

/**
 * Get all beaches
 * @return {string[]} Array of beach names
 */
export function getBeaches() {
  return temperatureData.beaches;
}

/**
 * Get all counties
 * @return {string[]} Array of county names
 */
export function getCounties() {
  return temperatureData.counties;
}

/**
 * Get all municipalities
 * @return {string[]} Array of municipality names
 */
export function getMunicipalities() {
  return temperatureData.municipalities;
}

/**
 * Get all temperature data
 * @return {object[]} Array of temperature objects
 */
export function getTemperatures() {
  return temperatureData.temperatures;
}

/**
 * Get beaches filtered by county
 * @param {string} county - The county name
 * @return {object[]} Array of matching temperature objects
 */
export function getBeachesByCounty(county) {
  return temperatureData.temperatures.filter(t => 
    t.location.region?.name === county
  );
}

/**
 * Get beaches filtered by municipality
 * @param {string} municipality - The municipality name
 * @return {object[]} Array of matching temperature objects
 */
export function getBeachesByMunicipality(municipality) {
  return temperatureData.temperatures.filter(t => 
    t.location.subregion?.name === municipality
  );
}

/**
 * Find a beach by exact name
 * @param {string} name - The beach name
 * @return {object|null} The matching beach or null if not found
 */
export function findBeachByName(name) {
  return temperatureData.temperatures.find(t => 
    t.location.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Search beaches by partial name
 * @param {string} partialName - The partial beach name
 * @return {object[]} Array of matching temperature objects
 */
export function searchBeaches(partialName) {
  return temperatureData.temperatures.filter(t => 
    t.location.name.toLowerCase().includes(partialName.toLowerCase())
  );
}

/**
 * Get beaches sorted by temperature (highest first)
 * @param {number} [limit] - Optional limit to the number of results
 * @return {object[]} Array of temperature objects sorted by temperature
 */
export function getBeachesByTemperature(limit) {
  const sorted = [...temperatureData.temperatures].sort((a, b) => 
    b.temperature - a.temperature
  );
  
  return limit ? sorted.slice(0, limit) : sorted;
}