# use-homeassistant

Helpers and hooks for building Homeassistant custom dashboards in React. Originally extracted from a personal dashboard. Connects to the Homeassistant websocket API via https://github.com/home-assistant/home-assistant-js-websocket, and the Homeassistant REST API.

## Basic usage

Wrap the components that require interaction with Homeassistant in a `HomeassistantProvider`, then use provided hooks to fetch data.

```js
import { HomeassistantProvider, useEntity } from 'use-homeassistant'

const url = 'http://homeassistant.local:8123'
const token = '...' // https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token

const Lightbulb = () => {
  const { state, attributes: { friendly_name } } = useEntity('entity.example_light')

  return <div>
    The light with HA name {friendly_name} is currently {state}
  </div>
}

const App = () => {
  return <HomeassistantProvider homeassistantUrl={url} accessToken={token}>
    <Lightbulb>
  </HomeassistantProvider>
}
```
