import fetch from 'node-fetch'
import { log, cacheFileName } from './utils.js'
import pkg from 'fs-extra'
const { outputJson, readFile, stat } = pkg

/**
 * TempData : { 
 * Counties: Array<String>,
 * Municipalities: Array<String>,
 * Beaches: Array<String>, 
 * Temperatures: Array<Object>
 *  }
 * @returns {Promise<{Timestamp:string,
 * Data:Array<Tempdata>,
 * Counties:Array<string>,
 * Municipalities:Array<string>,
 * Beaches:Array<string>}>}
 */

async function getTempData() {
  const apiEndpoint = "https://www.yr.no/api/v0/regions/NO/watertemperatures"
  const cacheTimeout = 1000 * 60 * 60 * 24 // 24 hours
  log("Getting tempdata")
  try {
    log(`Trying to read from ${cacheFileName}`)
    const cache_file = await readFile(cacheFileName, { encoding: 'utf8' })
    if (cache_file) {
      log("Cache file found")
      let cacheFileSize = (await stat(cacheFileName)).size
      log(`Cache size: ${Math.round(cacheFileSize / 1000)} KB`)
      let cache = JSON.parse(cache_file)
      let date = new Date()
      let now = date.getTime()
      let cacheAge = now - cache.Timestamp
      let cacheFresh = cacheAge < cacheTimeout
      log(`Cache age : ${(cacheAge / 1000 / 60).toFixed(1)} min`)
      if (cacheFresh) {
        log('Cache is fresh')
        const cachedData = {
          Timestamp: cache.Timestamp,
          Data: cache.Data,
          Counties: cache.Counties,
          Municipalities: cache.Municipalities,
          Beaches: cache.Beaches
        }
        return cachedData
      }
      else {
        log('Cache is stale, fetching fresh data')
        return await getFreshData()
      }
    }
  } catch (err) {
    log("No cache file found, fetching fresh data")
    return await getFreshData()
  }
  async function getFreshData() {
    const tempData = await fetch(apiEndpoint).then(r => r.json().then(d => d))
    log('Fetched fresh data')

    const counties = [], municipalities = [], beaches = []
    tempData.forEach(temp => {
      counties.indexOf(temp.location.region?.name) === -1 && counties.push(temp.location.region?.name)
      municipalities.indexOf(temp.location.subregion?.name) === -1 && municipalities.push(temp.location.subregion?.name)
      beaches.indexOf(temp.location.name) === -1 && beaches.push(temp.location.name)
    })

    counties.sort()
    municipalities.sort()
    beaches.sort()

    const data = {
      Timestamp: new Date().getTime(),
      Data: tempData,
      Counties: counties,
      Municipalities: municipalities,
      Beaches: beaches
    }

    // there's duplicate data here, but it's better doing it once per remote fetch than every time
    // takes up slightly more space, but saves cpu cycles
    await outputJson(cacheFileName, data)
    return data
  }
}

const tempData = await getTempData()
export const counties = tempData.Counties
export const municipalities = tempData.Municipalities
export const beaches = tempData.Beaches
export const temperatures = tempData.Data