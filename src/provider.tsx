import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { createConnection, createLongLivedTokenAuth, subscribeEntities } from 'home-assistant-js-websocket'
import { IHomeassistantContext } from './interfaces'

export const HomeassistantContext = createContext<IHomeassistantContext>({
  entities: {},
  homeassistantUrl: '',
  accessToken: ''
})

export const HomeassistantProvider = ({
  homeassistantUrl,
  accessToken,
  children,
  fallback
}: {
  homeassistantUrl: string
  accessToken: string
  children: ReactNode
  fallback?: ReactNode
}) => {
  const [connection, setConnection] = useState<IHomeassistantContext['connection']>()
  const [entities, setEntities] = useState<IHomeassistantContext['entities']>({})
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
