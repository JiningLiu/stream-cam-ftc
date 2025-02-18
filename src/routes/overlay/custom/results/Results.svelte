<svelte:options customElement="results-component" />

<script lang="ts">
	// import QRCode from 'qrcode';
	// import { onMount } from 'svelte';

	// onMount(() => {
	// 	let canvas = document.getElementById('qr');

	// 	QRCode.toCanvas(canvas, 'https://ftc.events/2024/USTXAUQ', {
	// 		margin: 0,
	// 		scale: 4,
	// 		color: { dark: '#ffffffff', light: '#11111100' }
	// 	});
	// });

	import { ResultsState, resultsStatusIsAwait, resultsStatusIsNotFull } from '$lib/types';

	let {
		state = ResultsState.AWAITING,
		name = 'Previous Match',
		blueTeams = [] as Team[],
		redTeams = [] as Team[],
		blueScore = '---',
		redScore = '---',
		blueAuto = '--',
		blueAutoSampleNet = '--',
		blueAutoSampleLow = '--',
		blueAutoSampleHigh = '--',
		blueAutoSpecimenLow = '--',
		blueAutoSpecimenHigh = '--',
		blue1AutoLocation = '--',
		blue2AutoLocation = '--',
		blueTeleop = '--',
		blueTeleopSampleNet = '--',
		blueTeleopSampleLow = '--',
		blueTeleopSampleHigh = '--',
		blueTeleopSpecimenLow = '--',
		blueTeleopSpecimenHigh = '--',
		blue1TeleopLocation = '--',
		blue2TeleopLocation = '--',
		blueFoulsReceived = '--',
		redAuto = '--',
		redAutoSampleNet = '--',
		redAutoSampleLow = '--',
		redAutoSampleHigh = '--',
		redAutoSpecimenLow = '--',
		redAutoSpecimenHigh = '--',
		red1AutoLocation = '--',
		red2AutoLocation = '--',
		redTeleop = '--',
		redTeleopSampleNet = '--',
		redTeleopSampleLow = '--',
		redTeleopSampleHigh = '--',
		redTeleopSpecimenLow = '--',
		redTeleopSpecimenHigh = '--',
		red1TeleopLocation = '--',
		red2TeleopLocation = '--',
		redFoulsReceived = '--'
	} = $props();

	type Team = {
		number?: string;
		name?: string;
		card?: number;
		ranking?: number;
		leagueRanking?: number;
		rankMove?: string;
	};

	function process(location: string): string {
		switch (location) {
			case 'NONE':
				return 'None';
			case 'OBSERVATION_ZONE':
				return 'O-Zone';
			case 'ASCENT':
				return 'A-Zone';
			case 'ASCENT_1':
				return 'Level 1';
			case 'ASCENT_2':
				return 'Level 2';
			case 'ASCENT_3':
				return 'Level 3';
		}
		return '--';
	}
</script>

<container>
	<div class="vstack padding">
		<h6 id="label" class:await={resultsStatusIsAwait(state)}>
			{resultsStatusIsAwait(state) ? 'Awaiting Results' : 'Final Results'}
		</h6>
		<h3 id="name" class:await={resultsStatusIsAwait(state)}>{@html name}</h3>

		<div id="teams" class="hstack">
			<div class="vstack" class:no-gap={resultsStatusIsAwait(state)}>
				{#each blueTeams as team}
					<div class="team-banner blue hstack vcenter" class:hidden={resultsStatusIsAwait(state)}>
						<p>{team.number}</p>
						{#if (team.ranking || 0) > 0}
							<div id="rankStack" class="vstack">
								<h3 class="rankMove {team.rankMove == 'UP' ? 'up' : 'dn'} results">􀆇</h3>
								<h3 class="rank results">{team.ranking}</h3>
								<h3 class="rankMove {team.rankMove == 'DOWN' ? 'down' : 'dn'} results">􀆈</h3>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="vstack">
				{#each redTeams as team}
					<div class="team-banner red hstack vcenter" class:hidden={resultsStatusIsAwait(state)}>
						{#if (team.ranking || 0) > 0}
							<div id="rankStack" class="vstack">
								<h3 class="rankMove {team.rankMove == 'UP' ? 'up' : 'dn'} results">􀆇</h3>
								<h3 class="rank results">{team.ranking}</h3>
								<h3 class="rankMove {team.rankMove == 'DOWN' ? 'down' : 'dn'} results">􀆈</h3>
							</div>
						{/if}
						<p>{team.number}</p>
					</div>
				{/each}
			</div>
		</div>

		<separator class:hidden={resultsStatusIsAwait(state)}></separator>

		<div id="scores" class="hstack" class:hidden={resultsStatusIsAwait(state)}>
			<h1 class="blue scpre">{blueScore}</h1>
			<h1 class="red score">{redScore}</h1>
		</div>

		<div class="section" class:hidden={resultsStatusIsAwait(state)}>
			<div class="hstack vcenter">
				<h2 class="big-score blue">{blueAuto}</h2>
				<div class="w-100"><h2 class="big-label">Auto</h2></div>
				<h2 class="big-score red">{redAuto}</h2>
			</div>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueAutoSampleNet}</p>
			<h3>Net Zone</h3>
			<p class="score red">{redAutoSampleNet}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueAutoSampleLow}</p>
			<h3>Low Basket</h3>
			<p class="score red">{redAutoSampleLow}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueAutoSampleHigh}</p>
			<h3>High Basket</h3>
			<p class="score red">{redAutoSampleHigh}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueAutoSpecimenLow}</p>
			<h3>Low Chamber</h3>
			<p class="score red">{redAutoSpecimenLow}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueAutoSpecimenHigh}</p>
			<h3>High Chamber</h3>
			<p class="score red">{redAutoSpecimenHigh}</p>
		</div>

		<div
			class="score-row location hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<div class="vstack left">
				<p class="score blue top">{process(blue1AutoLocation)}</p>
				<p class="score blue bottom">{process(blue2AutoLocation)}</p>
			</div>
			<h3>Location</h3>
			<div class="vstack right">
				<p class="score red top">{process(red1AutoLocation)}</p>
				<p class="score red bottom">{process(red2AutoLocation)}</p>
			</div>
		</div>

		<div class="section" class:hidden={resultsStatusIsAwait(state)}>
			<div class="hstack vcenter">
				<h2 class="big-score blue">{blueTeleop}</h2>
				<div class="w-100"><h2 class="big-label">TeleOp</h2></div>
				<h2 class="big-score red">{redTeleop}</h2>
			</div>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueTeleopSampleNet}</p>
			<h3>Net Zone</h3>
			<p class="score red">{redTeleopSampleNet}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueTeleopSampleLow}</p>
			<h3>Low Basket</h3>
			<p class="score red">{redTeleopSampleLow}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueTeleopSampleHigh}</p>
			<h3>High Basket</h3>
			<p class="score red">{redTeleopSampleHigh}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueTeleopSpecimenLow}</p>
			<h3>Low Chamber</h3>
			<p class="score red">{redTeleopSpecimenLow}</p>
		</div>

		<div
			class="score-row hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<p class="score blue">{blueTeleopSpecimenHigh}</p>
			<h3>High Chamber</h3>
			<p class="score red">{redTeleopSpecimenHigh}</p>
		</div>

		<div
			class="score-row location hstack vcenter space-between"
			class:hidden={resultsStatusIsNotFull(state)}
		>
			<div class="vstack left">
				<p class="score blue top">{process(blue1TeleopLocation)}</p>
				<p class="score blue bottom">{process(blue2TeleopLocation)}</p>
			</div>
			<h3>Location</h3>
			<div class="vstack right">
				<p class="score red top">{process(red1TeleopLocation)}</p>
				<p class="score red bottom">{process(red2TeleopLocation)}</p>
			</div>
		</div>

		<separator class:hidden={resultsStatusIsNotFull(state)}></separator>

		<div class="hstack hcenter fouls" class:hidden={resultsStatusIsAwait(state)}>
			<h3 class="blue-fouls w-100">{+blueFoulsReceived > 0 ? '+' : ''}{blueFoulsReceived}</h3>
			<h3>Fouls</h3>
			<h3 class="red-fouls w-100">{+redFoulsReceived > 0 ? '+' : ''}{redFoulsReceived}</h3>
		</div>

		<!-- <canvas id="qr"></canvas> -->
	</div>
</container>
<slot />

<style>
	container {
		display: flex;
		align-items: center;
		width: 18vw;
		margin: 0;
		padding: 0.4vw;
		color: #fff;
		background-color: #111;
		border-radius: 0.9vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);

		div {
			width: calc(100% - 0.8vw);
		}
	}

	#scores {
		width: calc(100% + 0.8vw);
		max-height: 3.8vw;
		gap: 0.4vw;

		h1 {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 3vw;
			font-size: 2.6vw;
			font-weight: 600;
			text-align: center;
			padding: 0.4vw 0.8vw;
			border-radius: 0.6vw;
		}
	}

	.section {
		width: calc(100% + 0.4vw);
		height: 2vw;
		max-height: 2vw;
		background-color: #eee;
		padding: 0.2vw;
		border-radius: 0.6vw;

		div {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
		}
	}

	.big-score {
		border-radius: 0.4vw;
	}

	h2 {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.2vw;
		font-weight: 500;
		text-align: center;
		padding: 0.2vw 0.4vw;
		height: calc(100% - 0.4vw);
	}

	h6 {
		font-size: 0.8vw;
	}

	#label {
		font-weight: 400;
		text-align: center;
		transform: translate(0, 0.25vw);
		color: #aaa;
		margin: 0;
		padding: 0;
		width: calc(100% + 0.8vw);
	}

	#label.await {
		transform: scale(1.25);
		margin: 0.5vw 0 0.1vw 0;
	}

	#name {
		font-size: 1.2vw;
		font-weight: 500;
		text-align: center;
		line-height: 1.4;
		margin: 0;
		padding: 0;
		width: calc(100% + 0.8vw);
	}

	#name.await {
		font-weight: 300;
	}

	#teams {
		width: calc(100% + 0.4vw);
		gap: 0.8vw;

		div {
			gap: 0.4vw;
		}
	}

	.team-banner {
		height: 1.8vw;
		max-height: 1.8vw;
		justify-content: space-between;
		padding: 0.4vw 0.6vw;
		border-radius: 0.6vw;

		* {
			width: fit-content;
		}

		p {
			font-size: 1.2vw;
		}

		#rankStack {
			padding-top: 0.1vw;
			gap: 0;
			align-items: center;
			width: fit-content;
		}

		.rank,
		.rankMove {
			line-height: 1;
			margin: 0;
			padding: 0;
		}

		.rank {
			font-size: 1.1vw;
			font-weight: 550;
		}

		.rankMove {
			font-size: 0.7vw;
			font-weight: 600;
		}
	}

	.big-label {
		font-size: 1.1vw;
		font-weight: 500;
		padding: 0;
		color: black;
	}

	.big-score {
		width: 4vw;
	}

	.blue {
		background-color: #045892;
	}

	.red {
		background-color: #b6191f;
	}

	h3 {
		font-size: 1vw;
		font-weight: 500;
		text-align: center;
		margin: 0.2vw 0.5vw;
	}

	.score {
		white-space: nowrap;
	}

	.score-row {
		width: calc(100% + 0.8vw);
		max-height: 1.8vw;
		gap: 0.4vw;

		.score {
			font-size: 1.1vw;
			text-align: center;
			width: 12%;
			padding: 0.2vw;
			border-radius: 0.4vw;
		}

		div {
			gap: 0.2vw;
			width: 25%;

			.score {
				width: 100%;
			}

			.top {
				border-radius: 0.4vw 0.4vw 0.1vw 0.1vw;
			}

			.bottom {
				border-radius: 0.1vw 0.1vw 0.4vw 0.4vw;
			}
		}

		.left {
			align-items: flex-start;
		}

		.right {
			align-items: flex-end;
		}
	}

	.score-row.location {
		max-height: 3.6vw;
	}

	.fouls {
		display: flex;
		justify-content: center;
		align-items: center;
		width: calc(100% + 0.8vw);
		height: 1.6vw;
		max-height: 1.6vw;

		.blue-fouls {
			text-align: right;
		}

		.red-fouls {
			text-align: left;
		}
	}

	.blue-fouls {
		color: #045892;
	}

	.red-fouls {
		color: #b6191f;
	}

	.padding {
		gap: 0.4vw;
	}

	.hidden {
		max-height: 0 !important;
		transform: scaleY(0);
		opacity: 0;
		margin: -0.2vw 0;
	}

	.team-banner.hidden {
		margin: -0.8vw 0;
	}

	.section.hidden {
		margin: -0.4vw 0;
	}

	separator {
		width: calc(100% + 0.8vw);
		margin: -0.1vw 0 -0.1vw 0;
		padding: 0;
		height: 0.08vw;
		background-color: #333;
	}
</style>
