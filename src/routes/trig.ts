import { readable } from 'svelte/store'

export const time = readable(0, set => {
    // let val = 0
    function newFrame(ms: number) {
		set(ms)
		globalThis.requestAnimationFrame?.(newFrame)
	}
	globalThis.requestAnimationFrame?.(newFrame)

})
