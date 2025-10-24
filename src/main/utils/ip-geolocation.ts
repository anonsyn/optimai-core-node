import axios from 'axios'
import log from '../configs/logger'

import { getErrorMessage } from './get-error-message'

export interface IpGeolocation {
  ip_address: string
  country: string
  country_code: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
}

/**
 * Fetch IP address and geolocation using a public API
 * Uses ip-api.com which is free and doesn't require an API key
 */
export async function getIpGeolocation(): Promise<IpGeolocation> {
  try {
    // ip-api.com provides free geolocation without API key
    // Limit: 45 requests per minute from an IP address
    const response = await axios.get('http://ip-api.com/json/', {
      timeout: 5000,
      params: {
        fields: 'status,message,country,countryCode,region,city,query,lat,lon'
      }
    })

    if (response.data.status === 'fail') {
      throw new Error(response.data.message || 'Geolocation API failed')
    }

    return {
      ip_address: response.data.query || 'Unknown',
      country: response.data.country || 'Unknown',
      country_code: response.data.countryCode || 'XX',
      city: response.data.city,
      region: response.data.region,
      latitude: response.data.lat,
      longitude: response.data.lon
    }
  } catch (error) {
    log.warn('[ip-geolocation] Failed to fetch IP geolocation:', getErrorMessage(error))

    // Fallback: try to get just the IP address from a simpler service
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', {
        timeout: 3000
      })

      return {
        ip_address: ipResponse.data.ip || 'Unknown',
        country: 'Unknown',
        country_code: 'XX'
      }
    } catch (fallbackError) {
      log.error('[ip-geolocation] Fallback IP fetch also failed:', getErrorMessage(fallbackError))

      return {
        ip_address: 'Unknown',
        country: 'Unknown',
        country_code: 'XX'
      }
    }
  }
}
