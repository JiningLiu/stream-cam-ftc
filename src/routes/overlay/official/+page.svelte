<script lang="ts">
	import { onMount } from 'svelte';

	let eventCode = 'USTXTBSQ';

	onMount(() => {
		eventCode = prompt("Event code:", eventCode) || eventCode;
	});
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
</head>

<iframe
	src="http://localhost/event/{eventCode.toLowerCase()}/display/?type=audience&bindToField=all&scoringBarLocation=bottom&allianceOrientation=standard&liveScores=true&mute=true&muteRandomizationResults=true&fieldStyleTimer=false&overlay=true&overlayColor=transparent&allianceSelectionStyle=classic&awardsStyle=overlay&dualDivisionRankingStyle=sideBySide&rankingsFontSize=larger&rankingsShowQR=false&showMeetRankings=false&rankingsAllTeams=true"
	frameborder="0"
	title="FTC Official Overlay"
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
