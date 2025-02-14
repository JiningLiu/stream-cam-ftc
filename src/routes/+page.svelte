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
		<iframe src="/cam?parameters={camParams}" frameborder="0" title="Camera Switcher" id="cam"></iframe>
	{/if}

	{#if overlayParams}
		<iframe
			src="/overlay/custom?parameters={overlayParams}"
			frameborder="0"
			title="Custom Overlay"
			id="overlay-custom"
		></iframe>
	{/if}
	<iframe src="/overlay/official" frameborder="0" title="Official Overlay" id="overlay-official"
	></iframe>
</main>

<style>
	:global(body) {
		overflow: hidden;
	}

	main {
		@media (min-aspect-ratio: 16 / 9) {
			* {
				left: 50%;
				width: calc(100vh / 9 * 16);
				height: 100vh;
				transform: translate(-50%, 0);
			}
		}

		@media (max-aspect-ratio: 16 / 9) {
			* {
				top: 50%;
				width: 100vw;
				height: calc(100vw / 16 * 9);
				transform: translate(0, -50%);
			}
		}
	}
</style>
