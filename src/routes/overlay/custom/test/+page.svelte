<script lang="ts">
	import Results from '../results/Results.svelte';
	import { ResultsState } from '$lib/types';
</script>

<head>
	<link rel="stylesheet" href="/overlays.css" />
</head>

<Results
	eventCode="USTXTBSQ"
	matchType="playoff"
	matchNumber="2"
	state={ResultsState.MINI}
	name={'Finals 1'}
	blueScore="23"
	redScore="12"
/>
