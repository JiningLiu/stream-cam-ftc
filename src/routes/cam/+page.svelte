<script lang="ts">
	import { onMount } from 'svelte';
	let parameters: string | null;

	onMount(() => {
		const params = new URLSearchParams(location.search);
		parameters = decodeURIComponent(params.get('parameters') || '');

		if (!parameters) {
			location.href = '/setup';
		}
	});
</script>

<iframe src="http://localhost:5173/?{parameters}" frameborder="0" title="Camera Switcher"></iframe>

<style>
	:global(:root) {
		overflow: hidden;
		background: transparent;
	}

	iframe {
		width: 100%;
		height: 100%;
	}
</style>
