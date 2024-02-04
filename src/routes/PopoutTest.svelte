<script lang="ts">
	import Sliders from './Sliders.svelte.js'
	import Popout from '$lib/Popout.svelte'
	import InnerStyleTest from './InnerStyleTest.svelte.js'
	import InheritStyleTest from './InheritStyleTest.svelte.js'
		
	let open = false
	let text = 'write <b>some</b> html <em>here</em>!'
	let width = 400
	let height = 400
	let left = 1200
	let top = 400
	
</script>

<button on:click={() => (open = !open)}>{open ? 'Close' : 'Open'} Popup</button><br />
<textarea bind:value={text} /> <br />
<InheritStyleTest /> <br />
<Sliders bind:width bind:left bind:height bind:top />

{#if open}
	<Popout on:close={() => (open = false)} bind:width bind:height bind:left bind:top>
		<h1>Hello micro-world!</h1>
		<InnerStyleTest />
		<InheritStyleTest />
		<p>
			{@html text}
		</p>
	</Popout>
{/if}
