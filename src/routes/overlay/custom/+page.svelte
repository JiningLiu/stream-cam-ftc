<script lang="ts">
	import { onMount } from 'svelte';
	let parameters: string | null;

	onMount(() => {
		const params = new URLSearchParams(location.search);
		parameters = params.get('parameters');

		if (!parameters) {
			location.href = '/setup';
		}
	});
</script>

<iframe src="http://localhost:8000/?{parameters}" frameborder="0" title="FTC Custom Overlay"
></iframe>

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
