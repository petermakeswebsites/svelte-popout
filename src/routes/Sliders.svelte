<script lang="ts">
	export let width: number
	export let height: number
	export let top: number
	export let left: number
</script>

<label for="widthSlider">Width:</label>
<input
	type="range"
	id="widthSlider"
	min="1"
	max="2000"
	bind:value={width}
	class="slider"
	aria-valuemin="1"
	aria-valuemax="2000"
	aria-valuenow={width}
/> <input type="number" id="widthInput" bind:value={width} class="input" aria-label="Width Value" /> <span id="widthResult">{width}</span><br />

<label for="heightSlider">Height:</label>
<input
	type="range"
	id="heightSlider"
	min="1"
	max="2000"
	bind:value={height}
	class="slider"
	aria-valuemin="1"
	aria-valuemax="2000"
	aria-valuenow={height}
/> <input type="number" id="heightInput" bind:value={height} class="input" aria-label="Height Value" /> <br />

<label for="leftSlider">Left:</label>
<input
	type="range"
	id="leftSlider"
	min="1"
	max="2000"
	bind:value={left}
	class="slider"
	aria-valuemin="1"
	aria-valuemax="2000"
	aria-valuenow={left}
/> <input type="number" id="leftInput" bind:value={left} class="input" aria-label="Left Value" /> <br />

<label for="topSlider">Top:</label>
<input
	type="range"
	id="topSlider"
	min="1"
	max="2000"
	bind:value={top}
	class="slider"
	aria-valuemin="1"
	aria-valuemax="2000"
	aria-valuenow={top}
/> <input type="number" id="topInput" bind:value={top} class="input" aria-label="Top Value" /> <br />
