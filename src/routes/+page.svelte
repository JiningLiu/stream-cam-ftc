<script lang="ts">
	import { onMount } from 'svelte';

	let camParams: string | null;
	let overlayParams: string | null;

	onMount(() => {
		const params = new URLSearchParams(location.search);
		camParams = params.get('camParams');
		overlayParams = params.get('overlayParams');

		if (!camParams || !overlayParams) {
			location.href = '/setup';
		}
	});
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
</head>

<main class="zstack">
	{#if camParams}
		<iframe src="/cam?parameters={camParams}" frameborder="0" title="Camera Switcher" id="cam"
		></iframe>
	{/if}

	{#if overlayParams}
		<iframe
			src="/overlay/custom?parameters={overlayParams}"
			frameborder="0"
			title="Custom Overlay"
			id="overlay-custom"
		></iframe>
	{/if}
</main>

<style>
	:global(body) {
		overflow: hidden;
	}

	main {
		* {
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		
		@media (min-aspect-ratio: 16 / 9) {
			* {
				width: calc(100vh / 9 * 16);
				height: 100vh;
			}
		}

		@media (max-aspect-ratio: 16 / 9) {
			* {
				width: 100vw;
				height: calc(100vw / 16 * 9);
			}
		}
	}
</style>
