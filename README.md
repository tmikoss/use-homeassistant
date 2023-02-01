# use-homeassistant

Helpers and hooks for building Homeassistant custom dashboards in React. Originally extracted from a personal dashboard. Connects to the Homeassistant websocket API via [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket), and the Homeassistant REST API.

## Usage

Wrap the components that require interaction with Homeassistant in a `HomeassistantProvider`, then use provided hooks to fetch data.

More in-depth [documentation is available here](https://tmikoss.github.io/use-homeassistant/).

```js
import { HomeassistantProvider, useEntity } from 'use-homeassistant'

const url = 'http://homeassistant.local:8123'
const token = '...' // https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token

const Lightbulb = ({ entityId }) => {
  const toggleLight = useToggleLight()

  const { state, attributes: { friendly_name } } = useEntity(entityId)

  return <div>
    The light with HA name {friendly_name} is currently {state}.
    <button onClick={() => toggleLight(entityId, state === 'on' ? false : true)}>
  </div>
}

const App = () => {
  return <HomeassistantProvider homeassistantUrl={url} accessToken={token}>
    <Lightbulb entityId='entity.example_light'>
  </HomeassistantProvider>
}
```
