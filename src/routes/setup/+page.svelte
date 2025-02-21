<script lang="ts">
	import { onMount } from 'svelte';

	interface CameraDetail {
		host: string;
		port: string;
		path: string;
	}

	let camDetails: CameraDetail[] = [
		{
			host: 'localhost',
			port: '5173',
			path: 'cam/test1'
		}
	];

	let overlaySocketHost = 'localhost';
	let overlayEventCode = 'ustxtbsq';

	let overlayInfoBannerText = 'FiT-Central Regional Championship';
	let overlayBlueSampleNetX = '';
	let overlayBlueSampleNetY = '';
	let overlayBlueSampleLowX = '';
	let overlayBlueSampleLowY = '';
	let overlayBlueSampleHighX = '';
	let overlayBlueSampleHighY = '';
	let overlayBlueSpecimenLowX = '';
	let overlayBlueSpecimenLowY = '';
	let overlayBlueSpecimenHighX = '';
	let overlayBlueSpecimenHighY = '';
	let overlayRedSampleNetX = '';
	let overlayRedSampleNetY = '';
	let overlayRedSampleLowX = '';
	let overlayRedSampleLowY = '';
	let overlayRedSampleHighX = '';
	let overlayRedSampleHighY = '';
	let overlayRedSpecimenLowX = '';
	let overlayRedSpecimenLowY = '';
	let overlayRedSpecimenHighX = '';
	let overlayRedSpecimenHighY = '';

	let entireUrl = '';
	let camUrl = '';
	let overlayUrl = '';
	let importUrl = '';

	onMount(() => {
		updateCam();
		updateOverlay();

		document.querySelectorAll('input.cam').forEach((input) => {
			input.addEventListener('keydown', (event) => {
				const keyboardEvent = event as KeyboardEvent;
				if (keyboardEvent.key === 'Enter') {
					updateCam();
				}
			});
		});

		document.querySelectorAll('input.overlay').forEach((input) => {
			input.addEventListener('keydown', (event) => {
				const keyboardEvent = event as KeyboardEvent;
				if (keyboardEvent.key === 'Enter') {
					updateOverlay();
				}
			});
		});
	});

	function updateCam() {
		let urls: string[] = [];
		camDetails.forEach((camDetail) => {
			const thisUrl = encodeURIComponent(
				`http://${camDetail.host}${camDetail.port ? ':' : ''}${camDetail.port}/${camDetail.path}`
			);
			urls.push(thisUrl);
		});

		camUrl = `http://${encodeURIComponent(location.hostname)}${
			encodeURIComponent(location.port) ? ':' : ''
		}${encodeURIComponent(location.port)}/cam?parameters=${encodeURIComponent(
			`streams=${encodeURIComponent(urls.join(','))}&ftclive=ws://${overlaySocketHost}/stream/display/command/?code=${overlayEventCode}`
		)}`;

		try {
			const camParams = new URL(camUrl).search.replace('?parameters=', '');
			const overlayParams = new URL(overlayUrl).search.replace('?parameters=', '');
			entireUrl = `http://${encodeURIComponent(location.hostname)}${
				encodeURIComponent(location.port) ? ':' : ''
			}${encodeURIComponent(location.port)}/?camParams=${encodeURIComponent(camParams)}&overlayParams=${encodeURIComponent(overlayParams)}`;
		} catch {}

		const camFrame = document.getElementById('cam') as HTMLIFrameElement;
		if (camFrame) {
			camFrame.src = camUrl;
		}
	}

	function updateOverlay() {
		overlayUrl = `http://${encodeURIComponent(location.hostname)}${
			encodeURIComponent(location.port) ? ':' : ''
		}${encodeURIComponent(location.port)}/overlay/custom?parameters=${encodeURIComponent(
			`socketUrl=ws%3A%2F%2F${encodeURIComponent(
				overlaySocketHost
			)}%2Fstream%2Fdisplay%2Fcommand%2F%3Fcode%3D${encodeURIComponent(
				overlayEventCode
			)}&infoBannerText=${encodeURIComponent(
				overlayInfoBannerText
			)}&blueSampleNetX=${encodeURIComponent(
				overlayBlueSampleNetX
			)}&blueSampleNetY=${encodeURIComponent(
				overlayBlueSampleNetY
			)}&blueSampleLowX=${encodeURIComponent(
				overlayBlueSampleLowX
			)}&blueSampleLowY=${encodeURIComponent(
				overlayBlueSampleLowY
			)}&blueSampleHighX=${encodeURIComponent(
				overlayBlueSampleHighX
			)}&blueSampleHighY=${encodeURIComponent(
				overlayBlueSampleHighY
			)}&blueSpecimenLowX=${encodeURIComponent(
				overlayBlueSpecimenLowX
			)}&blueSpecimenLowY=${encodeURIComponent(
				overlayBlueSpecimenLowY
			)}&blueSpecimenHighX=${encodeURIComponent(
				overlayBlueSpecimenHighX
			)}&blueSpecimenHighY=${encodeURIComponent(
				overlayBlueSpecimenHighY
			)}&redSampleNetX=${encodeURIComponent(overlayRedSampleNetX)}&redSampleNetY=${encodeURIComponent(
				overlayRedSampleNetY
			)}&redSampleLowX=${encodeURIComponent(overlayRedSampleLowX)}&redSampleLowY=${encodeURIComponent(
				overlayRedSampleLowY
			)}&redSampleHighX=${encodeURIComponent(
				overlayRedSampleHighX
			)}&redSampleHighY=${encodeURIComponent(
				overlayRedSampleHighY
			)}&redSpecimenLowX=${encodeURIComponent(
				overlayRedSpecimenLowX
			)}&redSpecimenLowY=${encodeURIComponent(
				overlayRedSpecimenLowY
			)}&redSpecimenHighX=${encodeURIComponent(
				overlayRedSpecimenHighX
			)}&redSpecimenHighY=${encodeURIComponent(overlayRedSpecimenHighY)}`
		)}`;

		try {
			const camParams = new URL(camUrl).search.replace('?parameters=', '');
			const overlayParams = new URL(overlayUrl).search.replace('?parameters=', '');
			entireUrl = `http://${encodeURIComponent(location.hostname)}${
				encodeURIComponent(location.port) ? ':' : ''
			}${encodeURIComponent(location.port)}/?camParams=${encodeURIComponent(camParams)}&overlayParams=${encodeURIComponent(overlayParams)}`;
		} catch {}

		const overlayFrame = document.getElementById('overlay') as HTMLIFrameElement;
		if (overlayFrame) {
			overlayFrame.src = overlayUrl;
		}
	}

	function copyEntireUrl() {
		navigator.clipboard.writeText(entireUrl);
	}

	function copyCamUrl() {
		navigator.clipboard.writeText(camUrl);
	}

	function copyOverlayUrl() {
		navigator.clipboard.writeText(overlayUrl);
	}

	function importFromUrl() {
		const url = new URL(importUrl);
		const tlp = new URLSearchParams(url.search);

		camDetails = [];
		const camParams = new URLSearchParams(`?${decodeURIComponent(tlp.get('camParams') || '')}`);
		camParams
			.get('streams')
			?.split(',')
			.forEach((stream) => {
				const url = new URL(decodeURIComponent(stream));
				camDetails = [
					...camDetails,
					{
						host: url.hostname,
						port: url.port,
						path: url.pathname.replace('/', '')
					}
				];
			});
		updateCam();

		const overlayParams = new URLSearchParams(
			`?${decodeURIComponent(tlp.get('overlayParams') || '')}`
		);
		overlayInfoBannerText = overlayParams.get('infoBannerText') || '';
		overlayBlueSampleNetX = overlayParams.get('blueSampleNetX') || '';
		overlayBlueSampleNetY = overlayParams.get('blueSampleNetY') || '';
		overlayBlueSampleLowX = overlayParams.get('blueSampleLowX') || '';
		overlayBlueSampleLowY = overlayParams.get('blueSampleLowY') || '';
		overlayBlueSampleHighX = overlayParams.get('blueSampleHighX') || '';
		overlayBlueSampleHighY = overlayParams.get('blueSampleHighY') || '';
		overlayBlueSpecimenLowX = overlayParams.get('blueSpecimenLowX') || '';
		overlayBlueSpecimenLowY = overlayParams.get('blueSpecimenLowY') || '';
		overlayBlueSpecimenHighX = overlayParams.get('blueSpecimenHighX') || '';
		overlayBlueSpecimenHighY = overlayParams.get('blueSpecimenHighY') || '';
		overlayRedSampleNetX = overlayParams.get('redSampleNetX') || '';
		overlayRedSampleNetY = overlayParams.get('redSampleNetY') || '';
		overlayRedSampleLowX = overlayParams.get('redSampleLowX') || '';
		overlayRedSampleLowY = overlayParams.get('redSampleLowY') || '';
		overlayRedSampleHighX = overlayParams.get('redSampleHighX') || '';
		overlayRedSampleHighY = overlayParams.get('redSampleHighY') || '';
		overlayRedSpecimenLowX = overlayParams.get('redSpecimenLowX') || '';
		overlayRedSpecimenLowY = overlayParams.get('redSpecimenLowY') || '';
		overlayRedSpecimenHighX = overlayParams.get('redSpecimenHighX') || '';
		overlayRedSpecimenHighY = overlayParams.get('redSpecimenHighY') || '';
		updateOverlay();
	}
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
</head>

<main>
	<div class="vstack hcenter s1 mv1">
		<p class="mh1">
			Press <b>Enter</b> on any text field to reload or apply changes for respective iframe.
		</p>

		<div class="vstack mh1">
			<h2>Cameras</h2>

			<div class="hstack s1 mv1">
				<button
					on:click={() => {
						camDetails = [
							...camDetails,
							{
								host: 'localhost',
								port: '5173',
								path: 'cam/test2'
							}
						];
						updateCam();
					}}
				>
					Add Camera
				</button>

				<button
					on:click={() => {
						camDetails = camDetails.slice(0, -1);
						updateCam();
					}}
				>
					Remove Last Camera
				</button>
			</div>

			{#each camDetails as cam}
				<div class="hstack s1">
					<div class="vstack">
						<p>Host</p>
						<input
							on:keypress={(event) => {
								const keyboardEvent = event as KeyboardEvent;
								if (keyboardEvent.key === 'Enter') {
									updateCam();
								}
							}}
							type="text"
							bind:value={cam.host}
							placeholder="rpi.local"
						/>
					</div>

					<div class="vstack">
						<p>Port</p>
						<input
							on:keypress={(event) => {
								const keyboardEvent = event as KeyboardEvent;
								if (keyboardEvent.key === 'Enter') {
									updateCam();
								}
							}}
							type="text"
							bind:value={cam.port}
							placeholder="8889"
						/>
					</div>

					<div class="vstack">
						<p>Path</p>
						<input
							on:keypress={(event) => {
								const keyboardEvent = event as KeyboardEvent;
								if (keyboardEvent.key === 'Enter') {
									updateCam();
								}
							}}
							type="text"
							bind:value={cam.path}
							placeholder="cam"
						/>
					</div>
				</div>
			{/each}
		</div>

		<div class="vstack m1">
			<h2>Details</h2>

			<div class="hstack s1">
				<div class="vstack">
					<p>FTCLive Host</p>
					<input
						class="overlay cam"
						type="text"
						bind:value={overlaySocketHost}
						placeholder="localhost"
					/>
				</div>

				<div class="vstack">
					<p>Event Code</p>
					<input
						class="overlay cam"
						type="text"
						bind:value={overlayEventCode}
						placeholder="ustxcgm4"
					/>
				</div>

				<div class="vstack">
					<p>Overlay Info Banner</p>
					<input
						class="overlay"
						type="text"
						bind:value={overlayInfoBannerText}
						placeholder="FiT-Central Regional Championship"
					/>
				</div>
			</div>
		</div>

		<div class="zstack">
			<iframe src={camUrl} frameborder="0" title="Camera Switcher" id="cam"></iframe>
			<iframe src={overlayUrl} id="overlay" title="overlay" frameborder="0"></iframe>
		</div>

		<div class="vstack mh1">
			<h2>Blue Scoring Elements</h2>

			<div class="hstack s1">
				<div class="vstack">
					<p>Blue Net Zone Samples X</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleNetX} />
					<p>Blue Net Zone Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleNetY} />
				</div>

				<div class="vstack">
					<p>Blue Low Basket Samples X</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleLowX} />
					<p>Blue Low Basket Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleLowY} />
				</div>

				<div class="vstack">
					<p>Blue High Basket Samples X</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleHighX} />
					<p>Blue High Basket Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayBlueSampleHighY} />
				</div>

				<div class="vstack">
					<p>Blue Low Chamber Specimen X</p>
					<input class="overlay" type="text" bind:value={overlayBlueSpecimenLowX} />
					<p>Blue Low Chamber Specimen Y</p>
					<input class="overlay" type="text" bind:value={overlayBlueSpecimenLowY} />
				</div>

				<div class="vstack">
					<p>Blue High Chamber Specimen X</p>
					<input class="overlay" type="text" bind:value={overlayBlueSpecimenHighX} />
					<p>Blue High Chamber Specimen Y</p>
					<input class="overlay" type="text" bind:value={overlayBlueSpecimenHighY} />
				</div>
			</div>
		</div>

		<div class="vstack mh1">
			<h2>Red Scoring Elements</h2>

			<div class="hstack s1">
				<div class="vstack">
					<p>Red Net Zone Samples X</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleNetX} />
					<p>Red Net Zone Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleNetY} />
				</div>

				<div class="vstack">
					<p>Red Low Basket Samples X</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleLowX} />
					<p>Red Low Basket Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleLowY} />
				</div>

				<div class="vstack">
					<p>Red High Basket Samples X</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleHighX} />
					<p>Red High Basket Samples Y</p>
					<input class="overlay" type="text" bind:value={overlayRedSampleHighY} />
				</div>

				<div class="vstack">
					<p>Red Low Chamber Specimen X</p>
					<input class="overlay" type="text" bind:value={overlayRedSpecimenLowX} />
					<p>Red Low Chamber Specimen Y</p>
					<input class="overlay" type="text" bind:value={overlayRedSpecimenLowY} />
				</div>

				<div class="vstack">
					<p>Red High Chamber Specimen X</p>
					<input class="overlay" type="text" bind:value={overlayRedSpecimenHighX} />
					<p>Red High Chamber Specimen Y</p>
					<input class="overlay" type="text" bind:value={overlayRedSpecimenHighY} />
				</div>
			</div>
		</div>

		<div class="vstack m1">
			<h2>Generated URLs</h2>

			<div class="hstack s1">
				<div class="vstack">
					<p>Entire Url</p>
					<input type="text" bind:value={entireUrl} readonly />
				</div>
				<button on:click={copyEntireUrl}>Copy the Entire URL</button>

				<div class="vstack">
					<p>Cameras</p>
					<input type="text" bind:value={camUrl} readonly />
				</div>
				<button on:click={copyCamUrl}>Copy Cameras URL</button>

				<div class="vstack">
					<p>Overlay</p>
					<input type="text" bind:value={overlayUrl} readonly />
				</div>
				<button on:click={copyOverlayUrl}>Copy Overlay URL</button>

				<div class="vstack">
					<p>Import From Url</p>
					<input type="text" bind:value={importUrl} />
				</div>
				<button on:click={importFromUrl}>Import from URL</button>
			</div>
		</div>
	</div>
</main>

<style>
	.zstack,
	iframe {
		width: 100vw;
		height: calc(100vw / 16 * 9);
	}

	#overlay {
		position: absolute;
	}

	input {
		font: 120%;
		border: 0.15em solid #000;
		border-radius: 0.4em;
	}

	.mh1 {
		margin: 0 1em;
	}

	.mv1 {
		margin: 1em 0;
	}

	.m1 {
		margin: 1em;
	}

	.s1 {
		gap: 1em;
	}
</style>
