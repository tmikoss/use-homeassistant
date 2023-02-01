import { callService } from 'home-assistant-js-websocket'
import { useCallback, useContext, useMemo } from 'react'
import useSWR from 'swr'
import { TCalendarEvent, THomeassistantEntity, TRestApiOptions } from './types'
import { HomeassistantContext } from './provider'

/**
 * Access main context, for functions currently not covered by the library.
 */
export const useHomeassistant = () => useContext(HomeassistantContext)

/**
 * Load data about entity by ID.
 *
 * ```ts
 * type LightAttributes = { brightness: number }
 * type LightState = 'on' | 'off'
 * const { state, attributes: { friendly_name } } = useEntity<LightAttributes, LightState>('entity.example_light')
 * ```
 * @typeParam TAttributes - Type of entity `attributes` attribute.
 * @typeParam TState - Type of entity `state` attribute.
 * @param entityId - full entity ID as displayed in Homeassistant
 * @returns Entity object, if found.
 */
export const useEntity = <TAttributes = Record<string, any>, TState = string>(entityId: string) => {
  const { entities } = useHomeassistant()
  return entities[entityId] as THomeassistantEntity<TAttributes, TState>
}

/**
 * Call a service via websocket API. There might be more specific helper methods for your use case in this library.
 *
 * ```ts
 * const LightsOff = () => {
 *   const callService = useCallService()
 *   return <button onClick={() => callService('scene', 'turn_on', { entity_id: 'scene.all_lights_off' })}>Lights off!</button>
 * }
 * ```
 *
 */
export const useCallService = () => {
  const { connection } = useHomeassistant()

  return useMemo(() => {
    if (connection) {
      return callService.bind(null, connection)
    } else {
      return () => new Promise((_resolve, reject) => reject())
    }
  }, [connection])
}

/**
 * Activate a scene by name.
 *
 * ```ts
 * const LightsOff = () => {
 *   const activateScene = useActivateScene()
 *   return <button onClick={() => activateScene('scene.all_lights_off')}>Lights off!</button>
 * }
 * ```
 */

export const useActivateScene = () => {
  const callService = useCallService()
  return useCallback((entity_id: string) => callService('scene', 'turn_on', { entity_id }), [callService])
}

/**
 * Turn a light on or off.
 *
 * ```ts
 * const LightOn = () => {
 *   const toggleLight = useToggleLight()
 *   return <button onClick={() => toggleLight('entity.example_light', true)}>Light on!</button>
 * }
 * ```
 */
export const useToggleLight = () => {
  const callService = useCallService()
  return useCallback(
    (entity_id: string, on: boolean) => callService('light', on ? 'turn_on' : 'turn_off', { entity_id }),
    [callService]
  )
}

/**
 * GET Homeassistant REST API endpoint via [SWR](https://github.com/vercel/swr) library. See https://developers.home-assistant.io/docs/api/rest/ for available endpoints.
 *
 * ```ts
 * type Response = { domain: string, services: string[] }[]
 * const Services = () => {
 *   const { data, error } = useHomeassistantRestApi<Response>('/api/services', { refreshInterval: 60 * 1000 })
 *   if (error) return <div>failed to load</div>
 *   if (!data) return <div>loading...</div>
 *   return <pre>{JSON.stringify(data)}</pre>
 * }
 * ```
 * @typeParam TResponse - Type of expected API response.
 * @param path - API path to call
 * @param options - Passed to SWR. See https://swr.vercel.app/docs/api#options
 */
export const useHomeassistantRestApi = <TResponse = any>(path: string, options?: TRestApiOptions<TResponse>) => {
  const { homeassistantUrl, accessToken } = useHomeassistant()

  const fetcher = useCallback(
    (url: string) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
      return fetch(url, { headers }).then((res) => res.json())
    },
    [accessToken]
  )

  return useSWR<TResponse>(`${homeassistantUrl}${path}`, fetcher, options)
}

/**
 * Load entity history by ID, using the REST API.
 *
 * ```ts
 * type LightAttributes = { brightness: number }
 * type LightState = 'on' | 'off'
 * const LightHistory = () => {
 *   const { data } = useEntityHistory<LightAttributes, LightState>('entity.example_light', { refreshInterval: 60 * 1000 })
 *   return <pre>{JSON.stringify(data)}</pre>
 * }
 * ```
 * @typeParam TAttributes - Type of entity `attributes` attribute.
 * @typeParam TState - Type of entity `state` attribute.
 * @typeParam TResponse - Type of expected API response. Constructed from TAttributes and TState by default.
 * @param entityId - full entity ID as displayed in Homeassistant
 * @param options - Passed to SWR. See https://swr.vercel.app/docs/api#options
 */
export const useEntityHistory = <
  TAttributes = Record<string, any>,
  TState = string,
  TResponse = THomeassistantEntity<TAttributes, TState>[][]
>(
  entityId: string,
  options?: TRestApiOptions<TResponse>
) => useHomeassistantRestApi<TResponse>(`/api/history/period?filter_entity_id=${entityId}`, options)

/**
 * Load calendar events by calendar ID, limited by given start and end dates.
 *
 * ```ts
 * const TodaysEvents = () => {
 *   const today = new Date()
 *   const { data } = useCalendar('calendar.main', { start: startOfDay(date), end: endOfDay(date) })
 *   return <pre>{JSON.stringify(data)}</pre>
 * }
 * ```
 * @typeParam TResponse - Type of expected API response.
 * @param calendarId - full calendar ID as displayed in Homeassistant
 * @param options - Other options passed to SWR. See https://swr.vercel.app/docs/api#options
 * @param options.start - Date range start for loaded calendar events
 * @param options.end - Date range end for loaded calendar events
 */
export const useCalendar = <TResponse = TCalendarEvent[]>(
  calendarId: string,
  options: { start: Date; end: Date } & TRestApiOptions<TResponse>
) => {
  const { start, end, ...reastApiOptions } = options

  return useHomeassistantRestApi<TResponse>(
    `/api/calendars/${calendarId}?start=${start.toISOString()}&end=${end.toISOString()}`,
    reastApiOptions
  )
}
