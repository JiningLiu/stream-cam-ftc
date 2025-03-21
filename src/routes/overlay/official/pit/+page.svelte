<script lang="ts">
	import { onMount } from 'svelte';

	let ip = 'localhost';
	let eventCode = 'USTXTBSQ';

	onMount(() => {
		ip = localStorage.getItem('official-ip') || ip;
		eventCode = localStorage.getItem('official-eventCode') || eventCode;

		ip = prompt('FTCLive IP:', ip) || ip;
		localStorage.setItem('official-ip', ip);

		eventCode = prompt('Event code:', eventCode) || eventCode;
		localStorage.setItem('official-eventCode', eventCode);
	});
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
</head>

<iframe
	src="http://{ip}/event/{eventCode.toLowerCase()}/display/?type=pit&bindToField=all&scoringBarLocation=bottom&allianceOrientation=standard&liveScores=true&mute=false&muteRandomizationResults=false&fieldStyleTimer=false&overlay=false&overlayColor=%2300FF00&allianceSelectionStyle=classic&awardsStyle=overlay&dualDivisionRankingStyle=sideBySide&rankingsFontSize=larger&rankingsShowQR=false&showMeetRankings=false&rankingsAllTeams=true"
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
