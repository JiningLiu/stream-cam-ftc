<script lang="ts">
	import { onMount } from 'svelte';
	enum State {
		PRE_START,
		AWAIT_MATCH,
		IN_MATCH,
		AWAIT_RESULTS,
		RESULTS_SHOWN
	}
	function parseState(n: number) {
		switch (n) {
			case 0:
				return 'PRE_START';
			case 1:
				return 'AWAIT_MATCH';
			case 2:
				return 'IN_MATCH';
			case 3:
				return 'AWAIT_RESULTS';
			case 4:
				return 'RESULTS_SHOWN';
		}
	}

	enum ResultsState {
		NO_RESULTS,
		AWAIT_FULL,
		AWAIT_MINI,
		FULL_RESULTS,
		MINI_RESULTS
	}

	let show = false;
	let sources: string[] = [];
	let current = 1;

	let state: State = State.PRE_START;
	let resultsState: ResultsState = ResultsState.NO_RESULTS;

	let matchTimeout: number | undefined;
	let resultsTimeout: number | undefined;

	let times = {
		tsStart: 0,
		localStart: 0
	};

	let started = false;
	let chaosArray: MessageEvent[] = [];

	let processingTypes = [
		'SHOW_MATCH',
		'START_MATCH',
		'SCORE_UPDATE',
		'ABORT_MATCH',
		'SHOW_RESULTS'
	];
	/**
	 * SHOW_PREVIEW
	 * SHOW_MATCH
	 * START_MATCH
	 * SCORE_UPDATE
	 * ABORT_MATCH
	 * SHOW_RESULTS
	 */
	let ws: WebSocket;

	onMount(() => {
		const paramsString = `?${decodeURIComponent(new URLSearchParams(location.search).get('parameters') || '')}`;
		const params = new URLSearchParams(paramsString);
		const ftclive = params.get('ftclive');
		const streams = params.get('streams');

		if (streams && ftclive) {
			sources = streams.split(',').map(decodeURIComponent);

			// MARK: START WEBSOCKET
			ws = new WebSocket(ftclive);
			ws.onopen = () => {
				setTimeout(() => {
					started = true;

					let maxTS: number = 0; //finds the highest TS value
					let maxIndex: number = 0; //finds the index of the highest TS

					for (let index = 0; index < chaosArray.length; index++) {
						let target = JSON.parse(chaosArray[index].data);
						if (!processingTypes.includes(target['type'])) {
							continue; //if the type shouldn't be passed in, ignore it
						}

						if (maxTS < target['ts']) {
							maxIndex = index; //other wise store both its index
							maxTS = target['ts']; //and the ts (to compare in future)
						}
					}
					fieldUpdate(chaosArray[maxIndex]); //update only the highest index
				}, 3000);
				show = true;
			};

			ws.onmessage = (message) => {
				if (!started) chaosArray.push(message);
				else fieldUpdate(message);
			};

			// MARK: debug
			// show = true;
			// setInterval(() => {
			// 	current = Math.floor(Math.random() * sources.length) + 1;
			// }, 1000);
		} else {
			const streams = +(prompt('Enter the number of streams:') || '-1');

			if (streams < 0) {
				location.reload();
				return;
			}

			const ftclive = prompt('Enter the FULL WebSocket URL for the FTCLive match display:') || '';

			if (streams == 0) {
				sources = ['/test1', '/test2'];
			}

			for (let i = 0; i < streams; i++) {
				sources.push(prompt(`Enter the stream URL for stream #${i + 1}:`) || '');
			}

			const sourcesParam = sources.map(encodeURIComponent).join(',');
			location.search = `?streams=${sourcesParam}&ftclive=${ftclive}`;
			return;
		}
	});

	let endGame = () => {
		console.log(
			'match over: local = ',
			Date.now() - times['localStart'],
			'ts = ',
			Date.now() - times['tsStart']
		);
		state = State.AWAIT_RESULTS;
		matchTimeout = undefined;
	};
	let closeResults = () => {
		state = State.AWAIT_MATCH;
		resultsTimeout = undefined;
	};
	let beginMatch = () => {
		// console.log('Match Started');
		if (matchTimeout != undefined) {
			console.log("Match Timeout didn't abort or end");
			clearTimeout(matchTimeout);
		}
		//
		// times['tsStart'] = JSON.parse(message.data)['ts'];
		// times['localStart'] = Date.now();
		//
		matchTimeout = setTimeout(endGame, 150000);
		state = State.IN_MATCH;
	};
	function fieldUpdate(message: MessageEvent) {
		// console.log(JSON.parse(message.data));
		try {
			const field = JSON.parse(message.data)['params']['field'];
			const type = JSON.parse(message.data)['type'];

			if (processingTypes.includes(type)) {
				let priorState = state;
				switch (state) {
					case State.PRE_START:
						if (type == 'SHOW_MATCH') {
							//trigger bottom bar
							current = field;
							state = State.AWAIT_MATCH;
						} else if (type == 'START_MATCH') {
							//trigger bottom bar
							current = field;
							beginMatch();
						}
						break;
					case State.AWAIT_MATCH:
						if (type == 'SHOW_MATCH') {
							current = field;
						} else if (type == 'START_MATCH') {
							current = field;
							beginMatch();
						}

						break;
					case State.IN_MATCH:
						if (type == 'ABORT_MATCH') {
							//
							// console.log('Match Aborted');
							//
							clearTimeout(matchTimeout);
							matchTimeout = undefined;
							state = State.AWAIT_MATCH;
						} else if (type == 'SCORE_UPDATE' && current == field) {
							//accept score updates
						}
						break;
					case State.AWAIT_RESULTS:
						if (type == 'SHOW_RESULTS') {
							state = State.RESULTS_SHOWN;
							resultsTimeout = setTimeout(closeResults, 20000);
						} else if (type == 'START_MATCH') {
							current = field;

							beginMatch();
						} else if (type == 'SHOW_MATCH') {
							current = field;
							state = State.AWAIT_MATCH;
						}
						break;
					case State.RESULTS_SHOWN:
						if (type == 'START_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;
							current = field;
							beginMatch();
						} else if (type == 'SHOW_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;
							state = State.AWAIT_MATCH;
							current = field;
						}
						break;
				}

				switch (resultsState) {
					case ResultsState.NO_RESULTS:
						if (state == State.AWAIT_RESULTS) {
							resultsState = ResultsState.AWAIT_FULL;
						}
						break;
					case ResultsState.AWAIT_FULL:
						if (type == 'SHOW_RESULTS') {
							resultsState = ResultsState.FULL_RESULTS;
							//show full results thing
						} else if (state == State.AWAIT_MATCH || state == State.IN_MATCH) {
							resultsState = ResultsState.AWAIT_MINI;
						}
						break;

					case ResultsState.FULL_RESULTS:
						if (state == State.AWAIT_MATCH || state == State.IN_MATCH) {
							resultsState = ResultsState.NO_RESULTS;
							//hide full results thing
						}
						break;

					case ResultsState.AWAIT_MINI:
						if (type == 'SHOW_RESULTS') {
							resultsState = ResultsState.MINI_RESULTS;
							//show mini results thing
							setTimeout(() => {
								resultsState = ResultsState.NO_RESULTS;
							}, 20000);
						}
						break;

					case ResultsState.MINI_RESULTS:
						if (state == State.AWAIT_RESULTS) {
							resultsState = ResultsState.AWAIT_FULL;
						}
						break;
				}
				console.log(
					'FIELD-DEBUG',
					'prior state: ' + parseState(priorState),
					'post state: ' + parseState(state),
					'method: ' + type,
					'field: ' + field
				);
			}
		} catch (e) {
			// console.error(e);
		}

		ws.onmessage = (message) => {
			fieldUpdate(message);
		};
	}
</script>

<main>
	{#each sources as source, i}
		<iframe
			class:inactive={i + 1 != current || !show}
			src={source}
			frameborder="0"
			title="source{i + 1}"
		></iframe>
	{/each}

	<p>Awaiting Feed. Please Standby.</p>
</main>

<style>
	* {
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: sans-serif;
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		color: white;
		background-color: #000;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	main {
		position: relative;
	}

	@media (min-aspect-ratio: 16 / 9) {
		main {
			width: calc(100vh / 9 * 16);
			height: 100vh;
		}
	}

	@media (max-aspect-ratio: 16 / 9) {
		main {
			width: 100vw;
			height: calc(100vw / 16 * 9);
		}
	}

	iframe {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.inactive {
		z-index: 9999;
		opacity: 0;
		transition: all 1s;
	}

	p {
		width: 100%;
		height: 100%;
		font-size: 1vw;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
