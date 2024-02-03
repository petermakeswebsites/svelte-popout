# Svelte Popout

> :warning: **Warning**: This library is still in development. Expect breaking changes and unstable features. Use at your own risk.

A Svelte component designed to create and manage popout windows, allowing for a seamless integration of detached UI elements into Svelte applications. This library provides a straightforward way to dynamically control popout windows with features such as sizing, positioning, and lifecycle callbacks.

## Installation

To install `svelte-popout`, use npm or yarn:

```bash
npm install svelte-popout
# OR
yarn add svelte-popout
```

## Usage

Import `Popout.svelte` in your Svelte component and use it as a wrapper around any content you wish to display in a popout window.

```svelte
<script>
  import Popout from 'svelte-popout';
  let width = 400;
  let height = 300;
  let top = 100;
  let left = 100;

  function onWindowInitialised(popupWindow) {
    if (popupWindow) {
      console.log('Popout window has been initialised');
    } else {
      console.error('Failed to open popout window');
    }
  }

  function onClose() {
    console.log("Popout window closed")
  }
</script>

<Popout {width} {height} {top} {left} windowInitialised={onWindowInitialised} on:close={onClose}>
  <div>Your content here</div>
</Popout>
```

## API

### Properties

- `width` (optional): The width of the popout window. Minimum value is 100.
- `height` (optional): The height of the popout window. Minimum value is 100.
- `left` (optional): The left position of the popout window relative to the screen.
- `top` (optional): The top position of the popout window relative to the screen.
- `positionPolling` (optional): Enables polling to update the popout window's position. Defaults to `true`.
- `positionPollingMs` (optional): Sets the polling interval in milliseconds. Defaults to `100`.
- `windowInitialised` (optional): A callback function that is called when the popout window is initialised.

### Events

- `close`: Dispatched when the popout window is closed.
- `beforeunload`: Dispatched before the popout window unloads.

## Development

This library includes commands for development and testing:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the library for production.
- `npm run preview`: Serves the built app for preview.
- `npm run test`: Runs integration and unit tests.
- `npm run lint`: Lints the codebase.
- `npm run format`: Formats the codebase using Prettier.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have feedback or ideas to improve `svelte-popout`.

## License

`svelte-popout` is MIT licensed.