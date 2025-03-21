<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let eventCode = 'USTXTBSQLM';
	let eventName = 'FiT-Central Regional Championship';
	let eventDivision = 'Lise Meitner';
	let mainMessage = 'Welcome';
	let secondaryMessage = 'The event live stream will begin at 11:00 AM.';

	onMount(() => {
		eventCode = localStorage.getItem('eventCode') || eventCode;
		eventName = localStorage.getItem('eventName') || eventName;
		eventDivision = localStorage.getItem('eventDivision') || eventDivision;
		mainMessage = localStorage.getItem('mainMessage') || mainMessage;
		secondaryMessage = localStorage.getItem('secondaryMessage') || secondaryMessage;
		setup();
	});

	function setup() {
		eventCode = prompt('Please enter the event code', eventCode) || eventCode;
		localStorage.setItem('eventCode', eventCode);
		eventName = prompt('Please enter the event name', eventName) || eventName;
		localStorage.setItem('eventName', eventName);
		eventDivision = prompt('Please enter the event division', eventDivision) || eventDivision;
		localStorage.setItem('eventDivision', eventDivision);
		mainMessage = prompt('Please enter the main message (largest)', mainMessage) || mainMessage;
		localStorage.setItem('mainMessage', mainMessage);
		secondaryMessage =
			prompt('Please enter the secondary message (description)', secondaryMessage) ||
			secondaryMessage;
		localStorage.setItem('secondaryMessage', secondaryMessage);

		let canvas = document.getElementById('qr');

		QRCode.toCanvas(canvas, `https://ftc.events/2024/${eventCode}`, {
			margin: 0,
			scale: 8,
			color: { dark: '#FFFFFFFF', light: '#00000000' }
		});
	}
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
</head>

<main>
	<container>
		<div id="mainHstackDiv" class="hstack vcenter">
			<div id="mainDiv" class="vstack">
				<div id="logoStack" class="hstack vcenter">
					<img id="ftcLogo" src="/imgs/ftc.png" alt="" />
					<vdivider></vdivider>
					<img id="wwRoboLogo" src="/imgs/wwrobo.png" alt="" />
				</div>

				<div id="largeTextStack" class="vstack">
					<h1>{mainMessage}</h1>
					<h3>{secondaryMessage}</h3>
				</div>

				<hdivider></hdivider>

				<div id="smallTextStack" class="vstack">
					<h4>{eventName}</h4>
					<h5>{eventDivision} Division</h5>
					<h6>{eventCode}</h6>
				</div>
			</div>

			<button on:click={setup}><img id="itdLogo" src="/imgs/itd.png" alt="" /></button>

			<canvas id="qr"></canvas>
		</div>
	</container>
</main>

<style>
	:global(:root),
	:global(body) {
		margin: 0;
		padding: 0;
		color: #fff;
		background: #000;
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;

		container {
			width: 100vw;
			height: calc(100vw / 16 * 9);

			@media (min-aspect-ratio: 16 / 9) {
				height: 100vh;
				width: calc(100vh / 9 * 16);
			}
			display: flex;
			justify-content: center;
			align-items: center;
			background: linear-gradient(135deg, #381b1b 0%, #000 50%, #181f3a 100%);
		}
	}

	#mainHstackDiv {
		gap: 3.2vw;
	}

	#mainDiv {
		display: flex;
		flex-direction: column;
		gap: 0.8vw;
	}

	#logoStack {
		gap: 1.6vw;
	}

	img {
		object-fit: contain;
	}

	#ftcLogo,
	#wwRoboLogo {
		height: 10vh;
	}

	button {
		color: #0000;
		background: #0000;
		border: none;
	}

	#itdLogo {
		width: 16vw;
	}

	#qr {
		width: 14vw !important;
		height: 14vw !important;
	}

	vdivider {
		width: 0.1vw;
		height: 8vh;
		background: #ffffff55;
	}

	#largeTextStack {
		margin-top: 0.2vw;
		gap: 0.2vw;
	}

	h1 {
		font-size: 5.6vw;
		font-weight: 600;
	}

	h3 {
		font-size: 2.4vw;
		font-weight: 500;
	}

	hdivider {
		width: 48vw;
		height: 0.1vw;
		margin: 0.4vw 0;
		background: #ffffff55;
	}

	#smallTextStack {
		gap: 0.4vw;
	}

	h4 {
		font-size: 2.2vw;
		font-weight: 300;
	}

	h5 {
		font-size: 2vw;
		font-weight: 600;
	}

	h6 {
		margin-top: 0.4vw;
		font-size: 1.6vw;
		font-weight: 500;
	}

	.vstack {
		display: flex;
		flex-direction: column;
	}

	.hstack {
		display: flex;
		flex-direction: row;
	}

	.vcenter {
		align-items: center;
	}
</style>
