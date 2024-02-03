<script context="module" lang="ts">
	import { createEventDispatcher } from 'svelte'
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
		 * return a function to be invoked upon destruction of the node
		 * @param window
		 */
		windowInitialised?: (window: Window | null) => void | (() => void)
	}

	export function popout(el: HTMLElement, { features, windowInitialised }: PopoutSettings = {}) {
		// Generate features string
		const featureString = Object.entries({ ...(features || {}), popup: 1 })
			.filter(([_, val]) => val !== undefined)
			.map(([key, val]) => `${key}=${val}`)
			.join(',')

		// Create new window context
		const popoutWindow = window.open('', '_blank', featureString)
		const customDestroy = windowInitialised?.(popoutWindow)
		popoutWindow?.addEventListener('close', (ev) => {})

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
			popoutWindow?.close()
			if (el.parentNode) {
				el.parentNode.removeChild(el)
			}
		}

		const target = popoutWindow?.document.body
		if (!target) throw new Error('Window was not found for updating')
		target.appendChild(el)
		el.hidden = false

		// Call at the start
		// update({ features })

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
	export let positionPolling = true
	export let positionPollingMs = 100
	export let windowInitialised: PopoutSettings['windowInitialised'] = undefined

	const dispatch = createEventDispatcher<{
		close: { evt: Event; popupWindow: Window | null }
		beforeunload: { evt: BeforeUnloadEvent; popupWindow: Window | null }
	}>()

	const onInitialise = (popupWindow: Window | null) => {
		const destroy = windowInitialised?.(popupWindow)
		if (!popupWindow) return destroy

		function updateDimensions() {
			if (popupWindow) {
				width = popupWindow.innerWidth
				height = popupWindow.innerHeight
				left = popupWindow.screenX
				top = popupWindow.screenY
			}
		}
		function resize(evt: UIEvent) {
			updateDimensions()
		}

		function close(evt: Event) {
			dispatch('close', { evt, popupWindow })
		}

		function beforeunload(evt: BeforeUnloadEvent) {
			updateDimensions()
			dispatch('beforeunload', { evt, popupWindow })
		}

		function checkPosition() {
			updateDimensions()
		}

		const interval = positionPolling ? setInterval(checkPosition, positionPollingMs) : -1

		popupWindow.addEventListener('resize', resize)
		popupWindow.addEventListener('unload', close)
		popupWindow.addEventListener('beforeunload', beforeunload)
		return () => {
			popupWindow?.removeEventListener('resize', resize)
			popupWindow?.removeEventListener('unload', close)
			popupWindow?.removeEventListener('beforeunload', beforeunload)
			clearInterval(interval)
			destroy?.()
		}
	}
</script>

<div
	use:popout={{ features: { width, height, top, left }, windowInitialised: onInitialise }}
	hidden
>
	<slot />
</div>
