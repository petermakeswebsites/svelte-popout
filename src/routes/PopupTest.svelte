<script lang="ts">
	import PopupTest from './PopupTest.svelte'
	import Popout from '$lib/Popout.svelte'
	import { time } from './trig.js'
	let open = false
	let text = 'write <b>some</b> html <em>here</em>!'
	let width = 300
	let height = 300
	let left = 800
	let top = 500

	$: left = 300 * (Math.sin($time / 500) + 1.2)
	$: top = 300 * (Math.cos($time / 500) + 1.2)
</script>

<button on:click={() => (open = !open)}>{open ? 'Close' : 'Open'} Popup</button><br />
<textarea bind:value={text} />
<br />
Width: <input type="range" min="1" max="2000" bind:value={width} class="slider" /><br />
Height: <input type="range" min="1" max="2000" bind:value={height} class="slider" /><br />
Left: <input type="range" min="1" max="2000" bind:value={left} class="slider" /><br />
Top: <input type="range" min="1" max="2000" bind:value={top} class="slider" /><br />
{#if open}
	<Popout on:close={() => (open = false)} bind:width bind:height bind:left bind:top>
		<h1>Hello micro-world!</h1>
		<p>
			{@html text}
		</p>
		<hr />
		<PopupTest />
	</Popout>
{/if}
