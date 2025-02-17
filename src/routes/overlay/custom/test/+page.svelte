<script lang="ts">
	import Results from '../results/Results.svelte';
	import { ResultsState } from '$lib/types';

	let resultsStatus = ResultsState.AWAITING;
</script>

<head>
	<link rel="stylesheet" href="/overlays.css" />
</head>

<Results
	state={resultsStatus}
	name="Qualification 3 of 12"
	blueScore="233"
	redScore="233"
	blueTeams={[
		{ number: '20240', ranking: 1, rankMove: 'UP' },
		{ number: '17113', ranking: 3 }
	]}
	redTeams={[
		{ number: '17315', ranking: 2 },
		{ number: '18886', ranking: 4, rankMove: 'DOWN' }
	]}
	blueAuto="111"
	blueAutoSampleNet="25"
	blueAutoSampleLow="20"
	blueAutoSampleHigh="30"
	blueAutoSpecimenLow="16"
	blueAutoSpecimenHigh="20"
	blue1AutoLocation="ASCENT_2"
	blue2AutoLocation="OBSERVATION_ZONE"
	blueTeleop="111"
	blueTeleopSampleNet="25"
	blueTeleopSampleLow="20"
	blueTeleopSampleHigh="30"
	blueTeleopSpecimenLow="16"
	blueTeleopSpecimenHigh="20"
	blue1TeleopLocation="ASCENT_3"
	blue2TeleopLocation="ASCENT_2"
	blueFoulsReceived="11"
	redAuto="111"
	redAutoSampleNet="25"
	redAutoSampleLow="20"
	redAutoSampleHigh="30"
	redAutoSpecimenLow="16"
	redAutoSpecimenHigh="20"
	red1AutoLocation="ASCENT_1"
	red2AutoLocation="OBSERVATION_ZONE"
	redTeleop="111"
	redTeleopSampleNet="25"
	redTeleopSampleLow="20"
	redTeleopSampleHigh="30"
	redTeleopSpecimenLow="16"
	redTeleopSpecimenHigh="20"
	red1TeleopLocation="ASCENT_3"
	red2TeleopLocation="ASCENT_1"
	redFoulsReceived="11"
/>

<button
	on:click={() => {
		resultsStatus = (() => {
			switch (resultsStatus) {
				case ResultsState.HIDDEN:
					return ResultsState.AWAITING;
				case ResultsState.AWAITING:
					return ResultsState.MINI;
				case ResultsState.MINI:
					return ResultsState.FULL;
				case ResultsState.FULL:
					return ResultsState.HIDDEN;
			}
		})();
	}}>toggle</button
>
