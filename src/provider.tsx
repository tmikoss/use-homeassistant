import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { createConnection, createLongLivedTokenAuth, subscribeEntities } from 'home-assistant-js-websocket'
import { THomeassistantContext } from './types'

/** @hidden */
export const HomeassistantContext = createContext<THomeassistantContext>({
  entities: {},
  homeassistantUrl: '',
  accessToken: ''
})

/**
Main wrapper component. Establishes connection to the Homeassistant websocket API on mount, and starts listening to entity data feed.

```ts
const App = () => {
  return <HomeassistantProvider homeassistantUrl={url} accessToken={token}>
    <Lightbulb>
  </HomeassistantProvider>
}
```

@param props.homeassistantUrl - Homeassistant URL you use to access the default web UI. Example: http://homeassistant.local:8123
@param props.accessToken - Long-lived access token. See https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token
@param props.fallback - Optional React component to display while entity data has not yet been loaded. Useful if you don't want to handle `useEntity` returning blank results on first render.
*/
export const HomeassistantProvider = (props: {
  homeassistantUrl: string
  accessToken: string
  children: ReactNode
  fallback?: ReactNode
}) => {
  const { homeassistantUrl, accessToken, children, fallback } = props
  const [connection, setConnection] = useState<THomeassistantContext['connection']>()
  const [entities, setEntities] = useState<THomeassistantContext['entities']>({})
  const [firstLoadCompleted, setFirstLoadCompleted] = useState(false)

  useEffect(() => {
    let stale = false

    const establishConnection = async () => {
      let connection = undefined

      try {
        const auth = await createLongLivedTokenAuth(homeassistantUrl, accessToken)
        connection = await createConnection({ auth })
      } catch (error) {
        console.error(error)
      }

      if (!stale) {
        setConnection(connection)
      }
    }

    establishConnection()

    return () => {
      stale = true
    }
  }, [homeassistantUrl, accessToken])

  useEffect(() => {
    if (connection) {
      return subscribeEntities(connection, (entities) => {
        setEntities(entities)
        setFirstLoadCompleted(true)
      })
    } else {
      return undefined
    }
  }, [connection])

  return (
    <HomeassistantContext.Provider value={{ entities, connection, homeassistantUrl, accessToken }}>
      {fallback && !firstLoadCompleted ? fallback : children}
    </HomeassistantContext.Provider>
  )
}
