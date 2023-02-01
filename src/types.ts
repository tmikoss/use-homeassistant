import { Connection, HassEntities, HassEntity } from 'home-assistant-js-websocket'
import { BareFetcher, PublicConfiguration } from 'swr/_internal'

export type THomeassistantContext = {
  entities: HassEntities
  connection?: Connection
  homeassistantUrl: string
  accessToken: string
}

export type THomeassistantEntity<TAttributes, TState> = HassEntity & {
  state: TState
  attributes: TAttributes
}

export type TRestApiOptions<TResponse> = Partial<PublicConfiguration<TResponse, unknown, BareFetcher<TResponse>>>

export type TCalendarEvent = {
  description?: string
  start: {
    date?: string
    dateTime?: string
  }
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
