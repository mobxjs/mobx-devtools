# mobx-devtools

DevTools for MobX to track the rendering behavior and data dependencies of your app.

## Browser extension
This repository is home for:
* [MobX Developer Tools for **Chrome**](https://chrome.google.com/webstore/detail/mobx-developer-tools/pfgnfdagidkfgccljigdamigbcnndkod)
* [MobX Developer Tools for **Firefox**](https://addons.mozilla.org/en-US/firefox/addon/mobx-devtools/)

## Mobx Devtools for React

![MobX DevTools](devtools.gif)

## Installation

`npm install --save-dev mobx-devtools`

or

`<script src="https://unpkg.com/mobx-devtools"></script>`

## Usage

Somewhere in your application, create a DevTools component:

```js
import DevTools from 'mobx-devtools/lib/chrome';

class MyApp extends React.Component {
  render() {
    return (
      <div>
        ...
        <DevTools />
      </div>
    );
  }
}
```

or

`React.createElement(mobxDevtools.default)`

Supported props:
* `highlightTimeout` — number, default: 1500
* `position` — object, position of control panel, default: `{ top: 0, right: 20 }`

From there on, after each rendering a reactive components logs the following three metrics:
1. Number of times the component did render so far
2. The time spend in the `render()` method of a component
3. The time spend from the start of the `render()` method until the changes are flushed to the DOM

For each component the color indicates roughly how long the coloring took. Rendering times are cumulative; they include time spend in the children
* Green: less then 25 ms
* Orange: less then 100 ms
* Red: rendering for this component took more than 100ms

### About log groups

Note that if logging is enabled, MobX actions and reactions will appear as collapsible groups inside the browsers console.
Mind that any log statements that are printed during these (re)actions will appear inside those groups as well, so that you can exactly trace when they are triggered.

### Configuration

```js
import { configureDevtool } from 'mobx-devtools';

// Any configurations are optional
configureDevtool({
  // Turn on logging changes button programmatically:
  logEnabled: true,
  // Turn off displaying components updates button programmatically:
  updatesEnabled: false,
  // Log only changes of type `reaction`
  // (only affects top-level messages in console, not inside groups)
  logFilter: change => change.type === 'reaction',
});

```

There are also aliases for turning on/off devtools buttons:

```js
import { setLogEnabled, setUpdatesEnabled, setGraphEnabled } from 'mobx-devtools';

setLogEnabled(true); // same as configureDevtool({ logEnabled: true });
setUpdatesEnabled(false); // same as configureDevtool({ updatesEnabled: false });
setGraphEnabled(false); // same as configureDevtool({ graphEnabled: false });
```

### Custom panel design

```js
import DevTools, { GraphControl, LogControl, UpdatesControl } from 'mobx-devtools';

class MyNiceButton extends React.Component {
  render() {
    const { active, onToggle, children } = this.props;
    return (
      <button onClick={onToggle}>
        {children}
        {active ? ' on' : ' off'}
      </button>
    );
  }
}

class MyApp extends React.Component {
  render() {
    return (
      <div>

        {/* Include somewhere with `noPanel` prop. Is needed to display updates and modals */}
        <DevTools noPanel />

        <div className="my-custom-devtools-panel-design">
          <GraphControl>
            {/* Must have only one child that takes props: `active` (bool), `onToggle` (func) */}
            <MyNiceButton>Graph</MyNiceButton>
          </GraphControl>
          <LogControl>
            {/* Must have only one child that takes props: `active` (bool), `onToggle` (func) */}
            <MyNiceButton>Log</MyNiceButton>
          </LogControl>
          <UpdatesControl>
            {/* Must have only one child that takes props: `active` (bool), `onToggle` (func) */}
            <MyNiceButton>Updates</MyNiceButton>
          </UpdatesControl>
        </div>
      </div>
    );
  }
}
```

## Hacking

Check the [HACKING.md](HACKING.md).
