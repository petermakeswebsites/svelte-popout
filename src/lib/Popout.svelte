<script context="module" lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import { enableStyleCopying } from './observe-styles.js'
	// import { BROWSER } from 'esm-env'

	type Features = {
		/**
		 * width of the content area, including scrollbars
		 *
		 * if set, minimum required value is 100
		 */
		width?: number
		/**
		 * height of the content area, including scrollbars
		 *
		 * if set, minimum required value is 100
		 */
		height?: number
		/**
		 * distance in pixels from the left side of the work area as defined by
		 * the user's operating system where the new window will be generated
		 */
		left?: number
		/**
		 * distance in pixels from the top side of the work area as defined by
		 * the user's operating system where the new window will be generated
		 */
		top?: number
	}
	type PopoutSettings = {
		features?: Features
		/**
		 * function that's called when the popup is initialised
		 *
		 * will supply null instead of window if failed to create window
		 *
		 * return a function to be invoked upon destruction of the component
		 * @param window
		 */
		windowInitialised?: (window: Window | null) => void | (() => void)
		/**
		 * copy and sync the styles of the topmost window into the child head element
		 *
		 * this is necessary for styling to work
		 *
		 * @default true
		 */
		copyStyles?: boolean
	}

	export function popout(
		el: HTMLElement,
		{ features, windowInitialised, copyStyles = true }: PopoutSettings = {}
	) {
		// generate features string
		const featureString = Object.entries({ ...(features || {}), popup: 1 })
			.filter(([_, val]) => val !== undefined)
			.map(([key, val]) => `${key}=${val}`)
			.join(',')

		// create new popup window context
		const popoutWindow = window.open('', '_blank', featureString)
		const customDestroy = windowInitialised?.(popoutWindow)

		// setup style syncing and grab the destroy callback
		const disableStyleCopying =
			copyStyles && popoutWindow ? enableStyleCopying(popoutWindow.document.head) : null

		// Handle updates, making sure to change to a modification pattern
		function update({ features = {} }: PopoutSettings = {}) {
			const { width, height, top, left } = features
			if (popoutWindow) {
				const windowWidth = popoutWindow.innerWidth
				const windowHeight = popoutWindow.innerHeight
				if (width && height) {
					if (windowWidth !== width || windowHeight !== height) {
						popoutWindow.resizeTo(width || windowWidth, height || windowHeight)
					}
				}

				if (popoutWindow.screenX !== left || popoutWindow.screenY !== top) {
					popoutWindow.moveTo(left || popoutWindow.screenLeft, top || popoutWindow.screenTop)
				}
			}
		}

		function destroy() {
			customDestroy?.()
			disableStyleCopying?.()
			popoutWindow?.close()
			if (el.parentNode) {
				el.parentNode.removeChild(el)
			}
		}

        // append the element to the popup window  
		const target = popoutWindow?.document.body
		if (!target) throw new Error('Window was not found for updating')
		target.appendChild(el)
		el.hidden = false

		return {
			update,
			destroy
		}
	}
</script>

<script lang="ts">
	export let width: Features['width'] = undefined
	export let height: Features['height'] = undefined
	export let top: Features['top'] = undefined
	export let left: Features['left'] = undefined
	export let copyStyles = true
	export let positionPolling = true
	export let positionPollingMs = 100
	export let windowInitialised: PopoutSettings['windowInitialised'] = undefined

	const dispatch = createEventDispatcher<{
		close: { evt: Event; popupWindow: Window | null }
		beforeunload: { evt: BeforeUnloadEvent; popupWindow: Window | null }
	}>()

	const onInitialise = (popupWindow: Window | null) => {
		// if failed to create the window, we'll call the supplied
		// callback if the user sent one
		const initialisationCallback = windowInitialised?.(popupWindow)
		if (!popupWindow) return initialisationCallback

		function updateDimensions() {
			if (popupWindow) {
				width = popupWindow.innerWidth
				height = popupWindow.innerHeight
				left = popupWindow.screenX
				top = popupWindow.screenY
			}
		}

		// reactivity hook for callback
		function resize(evt: UIEvent) {
			updateDimensions()
		}

		// attaching user-supplied close event
		function close(evt: Event) {
			dispatch('close', { evt, popupWindow })
		}

		// attaching user-supplied beforeunload
		function beforeunload(evt: BeforeUnloadEvent) {
			updateDimensions()
			dispatch('beforeunload', { evt, popupWindow })
		}

		// if polling is enabled, check every x ms for changes
		// in position & size
		function checkPosition() {
			updateDimensions()
		}

		const interval = positionPolling ? setInterval(checkPosition, positionPollingMs) : -1

		// append listeners
		popupWindow.addEventListener('resize', resize)
		popupWindow.addEventListener('unload', close)
		popupWindow.addEventListener('beforeunload', beforeunload)

		// destroy listeners - this is called when the use directive gets destroyed,
		// therefore it's not necessary to tie it to onDestroy(), as the directive
		// will be destroyed first
		return () => {
			popupWindow?.removeEventListener('resize', resize)
			popupWindow?.removeEventListener('unload', close)
			popupWindow?.removeEventListener('beforeunload', beforeunload)
			clearInterval(interval)
			initialisationCallback?.()
		}
	}
</script>

<div
	use:popout={{
		copyStyles,
		features: { width, height, top, left },
		windowInitialised: onInitialise
	}}
	hidden
>
	<slot />
</div>
