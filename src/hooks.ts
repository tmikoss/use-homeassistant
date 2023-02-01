import { callService } from 'home-assistant-js-websocket'
import { useCallback, useContext, useMemo } from 'react'
import useSWR from 'swr'
import { TCalendarEvent, THomeassistantEntity, TRestApiOptions } from './interfaces'
import { HomeassistantContext } from './provider'

export const useHomeassistant = () => useContext(HomeassistantContext)

export const useEntity = <TAttributes = Record<string, any>, TState = string>(entityId: string) => {
  const { entities } = useHomeassistant()
  return entities[entityId] as THomeassistantEntity<TAttributes, TState>
}

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

export const useActivateScene = () => {
  const callService = useCallService()
  return useCallback((entity_id: string) => callService('scene', 'turn_on', { entity_id }), [callService])
}

export const useToggleLight = () => {
  const callService = useCallService()
  return useCallback(
    (entity_id: string, on: boolean) => callService('light', on ? 'turn_on' : 'turn_off', { entity_id }),
    [callService]
  )
}

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

export const useEntityHistory = <
  TAttributes = Record<string, any>,
  TState = string,
  TResponse = THomeassistantEntity<TAttributes, TState>[][]
>(
  entityId: string,
  options?: TRestApiOptions<TResponse>
) => useHomeassistantRestApi<TResponse>(`/api/history/period?filter_entity_id=${entityId}`, options)

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
