<script lang="ts">
	import { onMount } from 'svelte';

	let initX = 0;
	let initY = 0;
	let x = 0;
	let y = 0;
	let dragging = false;

	function update() {
		let source = document.getElementById('draggable');

		if (!source) return;
		console.log("asfhk", { x: x, y: y });

		source.style.setProperty('--x', `${x}`);
		source.style.setProperty('--y', `${y}`);
		if (dragging) update();
	}

	onMount(() => {
		let source = document.getElementById('draggable');
		document.body.addEventListener('mousemove', (event) => {
			console.log({ x: event.x, y: event.y });
			x = event.x;
			y = event.y;
		});

		if (!source) return;
		source.style.setProperty('--x', '0');
		source.style.setProperty('--y', '0');

		source.addEventListener('mousedown', (event) => {
			// console.log(event.target);
			dragging = true;
			initX = event.x;
			initY = event.y;
			update();
			// console.log('dragstart: ', globalX, globalY);
			// console.log(event.screenX+", "+event.screenY);
		});

		source.addEventListener('dragend', (event) => {
			// reset the transparency
			let style = (event?.target as HTMLElement).style;
			if (!style) return;
			x = +style.getPropertyValue('--x') + event.x - initX;
			y = +style.getPropertyValue('--y') + event.y - initY;

			// console.log('dif: ', globalX - event.x, globalY - event.y);
			// console.log('og properties: ', style.getPropertyValue('--x'), style.getPropertyValue('--y'));

			// console.log('global: ', globalX, globalY);

			// style.setProperty('--x', `${x}`);
			// style.setProperty('--y', `${y}`);

			// console.log('finasl: ', x, y);
		});
	});
</script>

<head>
	<link rel="stylesheet" href="/overlays.css" />
</head>

<pos id="draggable">
	<div>This div is draggable</div>
</pos>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100vw;
		height: 100vh;
	}

	* {
		user-select: none;
	}
</style>
