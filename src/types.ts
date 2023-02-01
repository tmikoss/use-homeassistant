import { Connection, HassEntities, HassEntity } from 'home-assistant-js-websocket'
import { BareFetcher, PublicConfiguration } from 'swr/_internal'

/**
 * Main data context available via `useHomeasistant`.
 */
export type THomeassistantContext = {
  /** Current state of all entities as provided by websocket API */
  entities: HassEntities
  /** The current connection used by websocket API */
  connection?: Connection
  /** Homeassistant URL as passed in configuration */
  homeassistantUrl: string
  /** Long-lived access token as passed in configuration */
  accessToken: string
}

/** Type of single entity data returned by API
 *
 * ```ts
 * type LightAttributes = { brightness: number }
 * type LightState = 'on' | 'off'
 * type LightEntity = THomeassistantEntity<LightAttributes, LightState>
 * ```
 *
 * @typeParam TAttributes - Type of entity `attributes` attribute.
 * @typeParam TState - Type of entity `state` attribute.
 */
export type THomeassistantEntity<TAttributes, TState> = HassEntity & {
  state: TState
  attributes: TAttributes
}

/** Wrapper for [SWR](https://github.com/vercel/swr) library configuration options with given response shape.
 *
 * ```ts
 * type FetchServicesOptions = TRestApiOptions<{ domain: string, services: string[] }[]>
 * ```
 *
 * @typeParam TResponse - Type of expected API response.
 */
export type TRestApiOptions<TResponse> = Partial<PublicConfiguration<TResponse, unknown, BareFetcher<TResponse>>>

/** Shape of single calendar event returned by API */
export type TCalendarEvent = {
  description?: string
  /** Either `date` or `dateTime` should be present */
  start: {
    date?: string
    dateTime?: string
  }
  /** Either `date` or `dateTime` should be present */
  end: {
    date?: string
    dateTime?: string
  }
  location?: string
  summary?: string
  recurrence_id?: string
  uid?: string
  rrule?: string
}
