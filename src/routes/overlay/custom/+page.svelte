<script lang="ts">
	import ScoreBadge from './overlay/ScoreBadge.svelte';
	import InfoBanner from './overlay/InfoBanner.svelte';
	import TotalScoreCard from './overlay/TotalScoreCard.svelte';
	import TimerCard from './overlay/TimerCard.svelte';
	import TeamBanner from './overlay/TeamBanner.svelte';
	import Results from './results/Results.svelte';

	import { ResultsState } from '$lib/types';

	import { onMount } from 'svelte';

	import { v4 as uuidv4 } from 'uuid';

	const processingTypes = [
		'START_MATCH',
		'ABORT_MATCH',
		'SHOW_PREVIEW',
		'SHOW_MATCH',
		'SCORE_UPDATE',
		'SHOW_RESULTS'
	];

	enum State {
		PRE_START,
		AWAIT_MATCH,
		IN_MATCH,
		AWAIT_RESULTS
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
		}
	}

	let current = 1;

	let state: State = State.PRE_START;

	let matchTimeout: NodeJS.Timeout | undefined;

	let started = false;
	let chaosArray: GameUpdate[] = [];

	type GameUpdate = {
		type?: string;
		params?: Params;
		field?: number;
		init?: boolean; // Corresponds to initStatus in Swift
		ts?: number; // Corresponds to msEpoch in Swift
	};

	type Params = {
		liveScoringComplete?: boolean;
		someLocked?: boolean;
		redScores?: TeamScores;
		blueScores?: TeamScores;
		hrReview?: boolean;
		number?: number;
		series?: number;
		displayNumber?: number;
		matchName?: string;
		field?: number;
		elims?: boolean;
		red?: TeamDetails;
		blue?: TeamDetails;
		singleTeam?: boolean;
	};

	type TeamScores = {
		robot1Auto?: string;
		robot2Auto?: string;
		autoSampleNet?: number;
		autoSampleLow?: number;
		autoSampleHigh?: number;
		autoSpecimenLow?: number;
		autoSpecimenHigh?: number;
		teleopSampleNet?: number;
		teleopSampleLow?: number;
		teleopSampleHigh?: number;
		teleopSpecimenLow?: number;
		teleopSpecimenHigh?: number;
		robot1Teleop?: string;
		robot2Teleop?: string;
		minorFouls?: number;
		majorFouls?: number;
		autoSamplePoints?: number;
		autoSpecimenPoints?: number;
		autoParkPoints?: number;
		autoAscentPoints?: number;
		teleopSamplePoints?: number;
		teleopSpecimenPoints?: number;
		teleopParkPoints?: number;
		teleopAscentPoints?: number;
		autoPoints?: number;
		teleopPoints?: number;
		foulPointsCommitted?: number;
		preFoulTotal?: number;
		clazz?: string;
		adjust?: number;
	};

	type TeamDetails = {
		teams?: Team[];
		wins?: number;
		wonSeries?: boolean;
	};

	type Team = {
		number?: string;
		name?: string;
		card?: number;
		ranking?: number;
		leagueRanking?: number;
		rankMove?: string;
	};

	class CountdownTimer {
		private startTime: number = 0;
		private phaseTotalTime: number = 0;
		private timerStates: number[] = [30, 8, 120]; // 30 seconds, 8 seconds, and 2 minutes (120 seconds)
		private currentStateIndex: number = 0;
		private timerRunning: boolean = false;

		// Start the timer
		start(): void {
			if (this.timerRunning) return; // Prevent starting the timer if it's already running
			console.log('timer start');
			this.timerRunning = true;
			this.phaseTotalTime = this.timerStates[this.currentStateIndex];
			this.startTime = performance.now();
			switch (this.currentStateIndex) {
				case 0:
					mode = 'Auto';
					beforeTeleop = true;
					break;
				case 1:
					mode = 'Wait';
					beforeTeleop = true;
					break;
				case 2:
					mode = 'TeleOp';
					beforeTeleop = false;
			}
			this.tick();
		}

		// Abort the timer
		abort(): void {
			console.log('abort');
			this.timerRunning = false;
		}
		// set timer to 0
		clear(): void {
			// console.log('clear');
			this.timerRunning = false;
			this.phaseTotalTime = 0;
			time = 0;
		}
		// Reset the timer to its initial state
		reset(): void {
			console.log('reset');
			this.timerRunning = false;
			this.currentStateIndex = 0; // Start from the first timer state (30 seconds)
		}

		// Internal function that calculates time based on performance.now() and remaining time
		private tick(): void {
			if (!this.timerRunning) return;

			const now = performance.now();
			const elapsedTime = (now - this.startTime) / 1000; // time in seconds
			const timeLeft = this.phaseTotalTime - elapsedTime;

			// console.log("tick debug", "now: "+now, "elapsedTime: "+elapsedTime, "timeLeft: "+timeLeft, "startTime: "+this.startTime, "remainingTime: "+this.remainingTime);

			time = Math.max(timeLeft, 0);

			if (timeLeft <= 0) {
				this.advanceState();
			} else {
				requestAnimationFrame(() => this.tick()); // Continue ticking at next frame for smooth updates
			}
		}

		// Move to the next state and restart the countdown with the new value
		private advanceState(): void {
			if (this.currentStateIndex < this.timerStates.length - 1) {
				this.currentStateIndex++;
				this.phaseTotalTime = this.timerStates[this.currentStateIndex];
			} else {
				this.timerRunning = false;
				mode = 'In Review';
				beforeTeleop = false;
				return;
			}
			this.timerRunning = false;
			this.start();
		}

		//only for use of the special start match
		setTime(timeElapsed: number, beginTime: number): void {
			this.timerRunning = true;
			if (timeElapsed >= 158) {
				this.clear();
				beforeTeleop = false;
			}
			// if past auto and transition
			else if (timeElapsed >= 38) {
				this.startTime = beginTime + 38000;

				this.currentStateIndex = 2;
				mode = 'TeleOp';
				beforeTeleop = false;
			}
			//if past auto
			else if (timeElapsed >= 30) {
				this.startTime = beginTime + 30000;

				this.currentStateIndex = 1;
				mode = 'Wait';
				beforeTeleop = true;
			}
			//if in auto
			else {
				this.startTime = beginTime;

				// console.log('def: auto');
				this.currentStateIndex = 0;
				mode = 'Auto';
				beforeTeleop = true;
			}
			// console.log("setTime");
			this.phaseTotalTime = this.timerStates[this.currentStateIndex];

			// console.log(this.remainingTime, this.currentStateIndex);
			this.tick();
		}
	}

	//data
	interface ResultsItem {
		id: string;
		data: GameUpdate;
		state: ResultsState;
	}

	let data: GameUpdate | undefined;
	let resultsData: ResultsItem[] = [];
	let awaitResults: string[] = [];
	let displayAwaitResults: string[] = [];
	let currentResults: ResultsItem | undefined;

	//banner
	let time = 0;
	let mode = 'Connecting';
	let beforeTeleop = true;
	let infoBannerText = '';

	const timer = new CountdownTimer();

	let socket: WebSocket;

	let startX = 0; //temp x for drag
	let startY = 0; //temp y for drag

	let lastX = 0;
	let lastY = 0;
	let isSafari = false;
	onMount(() => {
		const paramsString = `?${new URLSearchParams(location.search).get('parameters')}`;
		const params = new URLSearchParams(paramsString);

		if (params.get('safari') == null) {
			params.append(
				'safari',
				String(
					confirm(
						'would you like to go to the alternate version of the overlay? The main drag and drop system is not supported in some browsers, but the alternate version is more computer intensive'
					)
				)
			);
		}

		isSafari = params.get('safari') == 'true';

		// if there are elements for each tag, then it will set the locations for that element
		const suppliedInfoBannerText = params.get('infoBannerText');
		if (suppliedInfoBannerText) {
			infoBannerText = suppliedInfoBannerText + ' • ';
		}

		const blueSampleNet = document.getElementById('blueSampleNet');
		if (blueSampleNet) {
			setUpBadge(blueSampleNet, params.get('blueSampleNetX'), params.get('blueSampleNetY'));
		}

		const blueSampleLow = document.getElementById('blueSampleLow');
		if (blueSampleLow) {
			blueSampleLow.style.setProperty('--x', params.get('blueSampleLowX'));
			blueSampleLow.style.setProperty('--y', params.get('blueSampleLowY'));

			setUpBadge(blueSampleLow, params.get('blueSampleLowX'), params.get('blueSampleLowY'));
		}

		const blueSampleHigh = document.getElementById('blueSampleHigh');
		if (blueSampleHigh) {
			blueSampleHigh.style.setProperty('--x', params.get('blueSampleHighX'));
			blueSampleHigh.style.setProperty('--y', params.get('blueSampleHighY'));

			setUpBadge(blueSampleHigh, params.get('blueSampleHighX'), params.get('blueSampleHighY'));
		}

		const blueSpecimenLow = document.getElementById('blueSpecimenLow');
		if (blueSpecimenLow) {
			blueSpecimenLow.style.setProperty('--x', params.get('blueSpecimenLowX'));
			blueSpecimenLow.style.setProperty('--y', params.get('blueSpecimenLowY'));

			setUpBadge(blueSpecimenLow, params.get('blueSpecimenLowX'), params.get('blueSpecimenLowY'));
		}

		const blueSpecimenHigh = document.getElementById('blueSpecimenHigh');
		if (blueSpecimenHigh) {
			blueSpecimenHigh.style.setProperty('--x', params.get('blueSpecimenHighX'));
			blueSpecimenHigh.style.setProperty('--y', params.get('blueSpecimenHighY'));

			setUpBadge(
				blueSpecimenHigh,
				params.get('blueSpecimenHighX'),
				params.get('blueSpecimenHighY')
			);
		}

		const redSampleNet = document.getElementById('redSampleNet');
		if (redSampleNet) {
			redSampleNet.style.setProperty('--x', params.get('redSampleNetX'));
			redSampleNet.style.setProperty('--y', params.get('redSampleNetY'));

			setUpBadge(redSampleNet, params.get('redSampleNetX'), params.get('redSampleNetY'));
		}

		const redSampleLow = document.getElementById('redSampleLow');
		if (redSampleLow) {
			redSampleLow.style.setProperty('--x', params.get('redSampleLowX'));
			redSampleLow.style.setProperty('--y', params.get('redSampleLowY'));

			setUpBadge(redSampleLow, params.get('redSampleLowX'), params.get('redSampleLowY'));
		}

		const redSampleHigh = document.getElementById('redSampleHigh');
		if (redSampleHigh) {
			redSampleHigh.style.setProperty('--x', params.get('redSampleHighX'));
			redSampleHigh.style.setProperty('--y', params.get('redSampleHighY'));

			setUpBadge(redSampleHigh, params.get('redSampleHighX'), params.get('redSampleHighY'));
		}

		const redSpecimenLow = document.getElementById('redSpecimenLow');
		if (redSpecimenLow) {
			redSpecimenLow.style.setProperty('--x', params.get('redSpecimenLowX'));
			redSpecimenLow.style.setProperty('--y', params.get('redSpecimenLowY'));

			setUpBadge(redSpecimenLow, params.get('redSpecimenLowX'), params.get('redSpecimenLowY'));
		}

		const redSpecimenHigh = document.getElementById('redSpecimenHigh');
		if (redSpecimenHigh) {
			redSpecimenHigh.style.setProperty('--x', params.get('redSpecimenHighX'));
			redSpecimenHigh.style.setProperty('--y', params.get('redSpecimenHighY'));

			setUpBadge(redSpecimenHigh, params.get('redSpecimenHighX'), params.get('redSpecimenHighY'));
		}

		//if we actually have a socket
		const socketUrl = params.get('socketUrl');
		if (socketUrl) {
			socket = new WebSocket(socketUrl);

			socket.onopen = () => {
				setTimeout(() => {
					started = true;

					let sortedChaos = chaosArray
						.sort((a, b) => {
							return (a['ts'] || 0) - (b['ts'] || 0);
						})
						.filter((a) => {
							return processingTypes.includes(a['type'] || '');
						});

					if (sortedChaos.length == 0) return;

					let latestStartUpdate: GameUpdate | undefined; // get the most recent start match

					// last index of a start_match
					for (const update of sortedChaos.toReversed()) {
						latestStartUpdate = update;
						break;
					}

					if (sortedChaos.at(-1)?.['type'] == 'SCORE_UPDATE') {
						for (const update of sortedChaos.toReversed()) {
							if (update['type'] == 'START_MATCH' || update['type'] == 'ABORT_MATCH') {
								if (update['type'] == 'ABORT_MATCH') {
									sortedChaos.splice(sortedChaos.lastIndexOf(update) + 1);
								}
								break;
							}
						}
					}

					let latestData: GameUpdate | undefined = (() => {
						if (!latestStartUpdate) return sortedChaos.at(-1);
						return sortedChaos.findLast(
							(a) => a['params']?.['matchName'] == latestStartUpdate['params']?.['matchName']
						);
					})();

					if (!latestData) return;

					if (
						(latestData['type'] == 'START_MATCH' || latestData['type'] == 'SCORE_UPDATE') &&
						latestStartUpdate &&
						latestStartUpdate['ts']
					) {
						data = latestData;
						const currentMs = Date.now();
						const elapsed = currentMs - latestStartUpdate['ts'];
						setTimeout(
							() => {
								timer.setTime(Math.ceil(elapsed / 1000), -elapsed + 1000);
							},
							elapsed - Math.floor(elapsed / 1000) * 1000
						);
						state = State.IN_MATCH;
						matchTimeout = setTimeout(endGame, 158000 + latestStartUpdate['ts'] - currentMs);
						return;
					} else if (latestData['type'] == 'SHOW_PREVIEW' || latestData['type'] == 'SHOW_MATCH') {
						data = latestData;
						mode = 'Standby';
						state = State.AWAIT_MATCH;
					} else {
						fieldUpdate(latestData);
					}
				}, 1000);
				console.log('FTCLive display WebSocket connected.');
			};

			socket.onmessage = (event) => {
				try {
					const update = JSON.parse(event.data);
					if (!started) {
						chaosArray.push(update);
					} else {
						fieldUpdate(update);
					}
				} catch {}
			};

			socket.onclose = () => {
				console.log('FTCLive display WebSocket closed.');
			};
		}
		// otherwise redirect to the builder
		else {
			location.href = './generate';
		}
	});

	let setUpBadge = (element: HTMLElement, x: string | null, y: string | null) => {
		// if it is a number and it is in vw, then allow it to work, otherwise set it to 0

		if (x != null && isNaN(Number(x.replace('vw', ''))) && x.includes('vw')) {
			element.style.setProperty('--x', x);
		} else {
			element.style.setProperty('--x', 0 + 'vw');
		}
		if (y != null && isNaN(Number(y.replace('vw', ''))) && y.includes('vw')) {
			element.style.setProperty('--y', y);
		} else {
			element.style.setProperty('--y', 0 + 'vw');
		}

		// set up drag i guess
		element.setAttribute('draggable', 'true');
		element.addEventListener('dragstart', (event) => {
			startX = event.x;
			startY = event.y;
		});

		// if we are in safari mode, it still works if we set the last location based on drag, instead of dragend
		// however, this does update it every single frame, so it is less optimal
		if (isSafari) {
			element.addEventListener('drag', (event) => {
				lastX = event.x;
				lastY = event.y;
			});

			element.addEventListener('dragend', (event) => {
				let style = (event?.target as HTMLElement).style;
				// get the style values (x,y)
				let propertyX = style.getPropertyValue('--x');
				let propertyY = style.getPropertyValue('--y');

				// remove all type identifiers (if its based on pixels, thn convert it)
				propertyX = propertyX.replace('vw', '');
				propertyY = propertyY.replace('vw', '');

				if (propertyX.includes('px')) {
					propertyX = propertyX.replace('px', '');
					propertyX = String(vw(propertyX));
				}
				if (propertyY.includes('px')) {
					propertyY = propertyY.replace('px', '');
					propertyY = String(vw(propertyY));
				}
				// get the difference and add that do the original location
				let x = Number(propertyX) + vw(lastX) - vw(startX);
				let y = Number(propertyY) + vw(lastY) - vw(startY);

				// set the style properties (x,y)
				style.setProperty('--x', String(x) + 'vw');
				style.setProperty('--y', String(y) + 'vw');
			});
		}

		// if we aren't in safari mode, we can do the more optimal system that only works on some browsers
		// This version doesn't have a call for each frame of drag and instead uses dragend
		else {
			element.addEventListener('dragend', (event) => {
				let style = (event?.target as HTMLElement).style;

				// get the style values (x,y)
				let propertyX = style.getPropertyValue('--x');
				let propertyY = style.getPropertyValue('--y');

				// remove all type identifiers (if its based on pixels, thn convert it)
				propertyX = propertyX.replace('vw', '');
				propertyY = propertyY.replace('vw', '');

				if (propertyX.includes('px')) {
					propertyX = propertyX.replace('px', '');
					propertyX = String(vw(propertyX));
				}
				if (propertyY.includes('px')) {
					propertyY = propertyY.replace('px', '');
					propertyY = String(vw(propertyY));
				}

				// get the difference and add that do the original location
				let x = Number(propertyX) + vw(event.x) - vw(startX);
				let y = Number(propertyY) + vw(event.y) - vw(startY);

				// set the style properties (x,y)
				style.setProperty('--x', String(x) + 'vw');
				style.setProperty('--y', String(y) + 'vw');
			});
		}
	};

	let vw = (px: number | string) => {
		return (Number(px) / window.innerWidth) * 100;
	};

	// fieldUpdate and its helper functions

	function fieldUpdate(update: GameUpdate) {
		try {
			const field = update['params']?.['field'];
			const type = update['type'];

			if (!field || !type) return;

			if (processingTypes.includes(type)) {
				switch (state) {
					case State.PRE_START:
						timer.clear();
						if (type == 'SHOW_PREVIEW' || type == 'SHOW_MATCH') {
							showMatch(field);
							data = update;
						} else if (type == 'START_MATCH') {
							startMatch(field);
							data = update;
						}
						break;
					case State.AWAIT_MATCH:
						if (
							type != 'SHOW_PREVIEW' &&
							type != 'SHOW_RESULTS' &&
							type != 'SCORE_UPDATE' &&
							type != 'ABORT_MATCH'
						) {
							data = update;
							mode = 'Standby';
						} else if (type == 'ABORT_MATCH') {
							data = update;
							mode = 'Aborted';
						}
						if (type == 'START_MATCH') {
							startMatch(field);
						}
						break;
					case State.IN_MATCH:
						if (type == 'ABORT_MATCH') {
							mode = 'Aborted';
							timer.clear();
							clearTimeout(matchTimeout);
							matchTimeout = undefined;

							beforeTeleop = true;

							state = State.AWAIT_MATCH;
						} else if (current == field) {
							data = update;
						}
						break;
					case State.AWAIT_RESULTS:
						timer.clear();
						if (type == 'SHOW_RESULTS') {
							newResults(update);
							state = State.PRE_START;
						} else if (type == 'START_MATCH') {
							startMatch(field);
							data = update;
						} else if (type == 'SHOW_MATCH') {
							showMatch(field);
							data = update;
						}
						break;
				}

				// console.log(
				// 	'STREAM DEBUG',
				// 	'prior:' + oldState,
				// 	'post: ' + parseState(state),
				// 	'type: ' + type
				// );
			}
		} catch {}
	}

	//fieldUpdate helpers
	let endGame = () => {
		if (
			data &&
			data['params'] &&
			data['params']['matchName'] &&
			!awaitResults.includes(data['params']['matchName'])
		) {
			awaitResults = [...awaitResults, data['params']['matchName']];
		}

		timer.clear();
		let oldState = parseState(state);
		// console.log('endgame');
		state = State.AWAIT_RESULTS;
		mode = 'In Review';
		matchTimeout = undefined;
		// console.log(
		// 	'OVERLAY DEBUG',
		// 	'prior:' + oldState,
		// 	'post: ' + parseState(state),
		// 	'type: endGame'
		// );
	};

	let showMatch = (field: number) => {
		let oldState = parseState(state);
		timer.clear(); //just in case
		beforeTeleop = true;
		mode = 'Standby';
		state = State.AWAIT_MATCH;
		current = field;
		// console.log(
		// 	'OVERLAY DEBUG',
		// 	'prior:' + oldState,
		// 	'post: ' + parseState(state),
		// 	'type: showMethod'
		// );
	};

	let startMatch = (field: number) => {
		let oldState = parseState(state);
		beforeTeleop = true;
		current = field;

		timer.reset();
		timer.start();
		if (matchTimeout != undefined) {
			console.log("Match Timeout didn't abort or end");
			clearTimeout(matchTimeout);
		}
		matchTimeout = setTimeout(endGame, 158000);
		state = State.IN_MATCH;
		// console.log(
		// 	'OVERLAY DEBUG',
		// 	'prior:' + oldState,
		// 	'post: ' + parseState(state),
		// 	'type: startMethod'
		// );
	};

	//i forget
	function newResults(update: GameUpdate, providedState?: ResultsState) {
		if (resultsData.some((i) => i.data['params']?.['matchName'] == update['params']?.['matchName']))
			return;

		// if call is to await match results, store into await array & return
		const matchName = update['params']?.['matchName'];
		if (providedState == ResultsState.AWAITING && matchName && !awaitResults.includes(matchName)) {
			awaitResults = [...awaitResults, matchName];
			return;
		}

		// show results queueing
		let thisItem: ResultsItem = {
			id: uuidv4(),
			data: update,
			state: ResultsState.HIDDEN
		};

		resultsData = [...resultsData, thisItem];
	}

	function advanceResults() {
		const thisItem = resultsData.at(0);
		if (!thisItem) return;

		const thisState: ResultsState = (() => {
			if ([State.AWAIT_RESULTS, State.PRE_START].includes(state) && awaitResults.length <= 0) {
				return ResultsState.FULL;
			} else {
				return ResultsState.MINI;
			}
		})();

		awaitResults = awaitResults.filter((i) => i != thisItem.data['params']?.['matchName']);
		currentResults = thisItem;

		setTimeout(() => {
			if (currentResults) {
				currentResults.state = thisState;
				currentResults = currentResults;
			}

			setTimeout(() => {
				if (currentResults) {
					currentResults.state = ResultsState.HIDDEN;
					currentResults = currentResults;
				}

				setTimeout(() => {
					currentResults = undefined;
					resultsData = resultsData.filter((i) => i.id != thisItem.id);

					advanceResults();
				}, 500);
			}, 30000);
		}, 500);
	}

	$: {
		// when match starts, make current result mini
		if ([State.AWAIT_MATCH, State.IN_MATCH].includes(state) || awaitResults.length > 0) {
			let results = currentResults;
			if (
				results &&
				results.state != ResultsState.HIDDEN &&
				results.state != ResultsState.AWAITING
			) {
				results.state = ResultsState.MINI;
				currentResults = currentResults;
			}
		}

		if (resultsData.length > 0) {
			if (currentResults?.id != resultsData[0].id) {
				advanceResults();
			}
		}

		if (awaitResults.length <= 0) {
			setTimeout(() => {
				if (awaitResults.length <= 0) {
					displayAwaitResults = [];
				}
			}, 500);
		} else {
			displayAwaitResults = awaitResults;
		}
	}
</script>

<head>
	<link rel="stylesheet" href="/overlays.css" />
</head>
<main>
	<overlay class:hidden={currentResults?.state == ResultsState.FULL || !data}>
		<pos id="blueSampleNet">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="2"
				pos="1"
				score={data?.params?.blueScores?.teleopSampleNet?.toString()}
			/>
		</pos>
		<pos id="blueSampleLow">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="0"
				pos="1"
				score={data?.params?.blueScores?.teleopSampleLow?.toString()}
			/>
		</pos>
		<pos id="blueSampleHigh">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="0"
				pos="0"
				score={data?.params?.blueScores?.teleopSampleHigh?.toString()}
			/>
		</pos>
		<pos id="blueSpecimenLow">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="1"
				pos="1"
				score={data?.params?.blueScores?.teleopSpecimenLow?.toString()}
			/>
		</pos>
		<pos id="blueSpecimenHigh">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="1"
				pos="0"
				score={data?.params?.blueScores?.teleopSpecimenHigh?.toString()}
			/>
		</pos>

		<pos id="redSampleNet">
			<ScoreBadge
				alliance="red"
				order="1"
				type="2"
				pos="0"
				score={data?.params?.redScores?.teleopSampleNet?.toString()}
			/>
		</pos>
		<pos id="redSampleLow">
			<ScoreBadge
				alliance="red"
				order="1"
				type="0"
				pos="1"
				score={data?.params?.redScores?.teleopSampleLow?.toString()}
			/>
		</pos>
		<pos id="redSampleHigh">
			<ScoreBadge
				alliance="red"
				order="1"
				type="0"
				pos="0"
				score={data?.params?.redScores?.teleopSampleHigh?.toString()}
			/>
		</pos>
		<pos id="redSpecimenLow">
			<ScoreBadge
				alliance="red"
				order="1"
				type="1"
				pos="1"
				score={data?.params?.redScores?.teleopSpecimenLow?.toString()}
			/>
		</pos>
		<pos id="redSpecimenHigh">
			<ScoreBadge
				alliance="red"
				order="1"
				type="1"
				pos="0"
				score={data?.params?.redScores?.teleopSpecimenHigh?.toString()}
			/>
		</pos>

		<div id="bottom" class="hgrid s12">
			<div class="vgrid s8">
				<TeamBanner
					alliance="blue"
					teamNumber={data?.params?.blue?.teams?.[0]?.number}
					teamName={data?.params?.blue?.teams?.[0]?.name}
					rank={data?.params?.blue?.teams?.[0]?.ranking?.toString()}
					leagueRank={data?.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data?.params?.blue?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="blue"
					teamNumber={data?.params?.blue?.teams?.[1]?.number}
					teamName={data?.params?.blue?.teams?.[1]?.name}
					rank={data?.params?.blue?.teams?.[1]?.ranking?.toString()}
					leagueRank={data?.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data?.params?.blue?.teams?.[1]?.rankMove}
				/>
			</div>

			<div class="vgrid s12">
				<InfoBanner text="{infoBannerText}{data?.params?.matchName}" />
				<div class="hgrid s12">
					<!-- the blue and red ones that have the big number in it -->
					<TotalScoreCard
						alliance="blue"
						score={(
							((beforeTeleop
								? data?.params?.blueScores?.autoPoints
								: data?.params?.blueScores?.preFoulTotal) || 0) +
							(data?.params?.redScores?.foulPointsCommitted || 0)
						).toString()}
					/>
					<TimerCard timer={time.toString()} {mode} />
					<TotalScoreCard
						alliance="red"
						score={(
							((beforeTeleop
								? data?.params?.redScores?.autoPoints
								: data?.params?.redScores?.preFoulTotal) || 0) +
							(data?.params?.blueScores?.foulPointsCommitted || 0)
						).toString()}
					/>
				</div>
			</div>

			<div class="vgrid s8">
				<TeamBanner
					alliance="red"
					teamNumber={data?.params?.red?.teams?.[0]?.number}
					teamName={data?.params?.red?.teams?.[0]?.name}
					rank={data?.params?.red?.teams?.[0]?.ranking?.toString()}
					leagueRank={data?.params?.red?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data?.params?.red?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="red"
					teamNumber={data?.params?.red?.teams?.[1]?.number}
					teamName={data?.params?.red?.teams?.[1]?.name}
					rank={data?.params?.red?.teams?.[1]?.ranking?.toString()}
					leagueRank={data?.params?.red?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data?.params?.red?.teams?.[1]?.rankMove}
				/>
			</div>
		</div>

		<shadow-rect></shadow-rect>
	</overlay>

	<results>
		<div class="vstack container">
			<div
				id="await"
				class:away={!(awaitResults.length > 0 && currentResults?.state != ResultsState.FULL)}
			>
				<Results state={ResultsState.AWAITING} name={displayAwaitResults.join('<br>')} />
			</div>

			{#if currentResults}
				<div id="results" class:away={currentResults.state == ResultsState.HIDDEN}>
					<Results
						state={currentResults.state}
						name={currentResults.data.params?.matchName}
						blueScore={(
							(currentResults.data.params?.blueScores?.preFoulTotal || 0) +
							(currentResults.data.params?.redScores?.foulPointsCommitted || 0)
						).toString()}
						redScore={(
							(currentResults.data.params?.redScores?.preFoulTotal || 0) +
							(currentResults.data.params?.blueScores?.foulPointsCommitted || 0)
						).toString()}
						blueTeams={currentResults.data.params?.blue?.teams}
						redTeams={currentResults.data.params?.red?.teams}
						blueAuto={currentResults.data.params?.blueScores?.autoPoints?.toString()}
						blueAutoSampleNet={currentResults.data.params?.blueScores?.autoSampleNet?.toString()}
						blueAutoSampleLow={currentResults.data.params?.blueScores?.autoSampleLow?.toString()}
						blueAutoSampleHigh={currentResults.data.params?.blueScores?.autoSampleHigh?.toString()}
						blueAutoSpecimenLow={currentResults.data.params?.blueScores?.autoSpecimenLow?.toString()}
						blueAutoSpecimenHigh={currentResults.data.params?.blueScores?.autoSpecimenHigh?.toString()}
						blue1AutoLocation={currentResults.data.params?.blueScores?.robot1Auto}
						blue2AutoLocation={currentResults.data.params?.blueScores?.robot2Auto}
						blueTeleop={currentResults.data.params?.blueScores?.teleopPoints?.toString()}
						blueTeleopSampleNet={currentResults.data.params?.blueScores?.teleopSampleNet?.toString()}
						blueTeleopSampleLow={currentResults.data.params?.blueScores?.teleopSampleLow?.toString()}
						blueTeleopSampleHigh={currentResults.data.params?.blueScores?.teleopSampleHigh?.toString()}
						blueTeleopSpecimenLow={currentResults.data.params?.blueScores?.teleopSpecimenLow?.toString()}
						blueTeleopSpecimenHigh={currentResults.data.params?.blueScores?.teleopSpecimenHigh?.toString()}
						blue1TeleopLocation={currentResults.data.params?.blueScores?.robot1Teleop}
						blue2TeleopLocation={currentResults.data.params?.blueScores?.robot2Teleop}
						blueFoulsReceived={currentResults.data.params?.redScores?.foulPointsCommitted?.toString()}
						redAuto={currentResults.data.params?.redScores?.autoPoints?.toString()}
						redAutoSampleNet={currentResults.data.params?.redScores?.autoSampleNet?.toString()}
						redAutoSampleLow={currentResults.data.params?.redScores?.autoSampleLow?.toString()}
						redAutoSampleHigh={currentResults.data.params?.redScores?.autoSampleHigh?.toString()}
						redAutoSpecimenLow={currentResults.data.params?.redScores?.autoSpecimenLow?.toString()}
						redAutoSpecimenHigh={currentResults.data.params?.redScores?.autoSpecimenHigh?.toString()}
						red1AutoLocation={currentResults.data.params?.redScores?.robot1Auto}
						red2AutoLocation={currentResults.data.params?.redScores?.robot2Auto}
						redTeleop={currentResults.data.params?.redScores?.teleopPoints?.toString()}
						redTeleopSampleNet={currentResults.data.params?.redScores?.teleopSampleNet?.toString()}
						redTeleopSampleLow={currentResults.data.params?.redScores?.teleopSampleLow?.toString()}
						redTeleopSampleHigh={currentResults.data.params?.redScores?.teleopSampleHigh?.toString()}
						redTeleopSpecimenLow={currentResults.data.params?.redScores?.teleopSpecimenLow?.toString()}
						redTeleopSpecimenHigh={currentResults.data.params?.redScores?.teleopSpecimenHigh?.toString()}
						red1TeleopLocation={currentResults.data.params?.redScores?.robot1Teleop}
						red2TeleopLocation={currentResults.data.params?.redScores?.robot2Teleop}
						redFoulsReceived={currentResults.data.params?.blueScores?.foulPointsCommitted?.toString()}
					/>
				</div>
			{/if}
		</div>
	</results>
</main>

<style>
	main {
		overflow: hidden;
		z-index: -2;
	}

	.hidden {
		opacity: 0;
	}

	#bottom {
		position: absolute;
		bottom: 1.2vw;
		align-items: end;
	}

	results {
		.container {
			position: absolute;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			top: 1.2vw;
			right: 1.2vw;
			gap: 0.8vw;

			#results {
				position: static;
			}

			.away {
				opacity: 0;

				&#await {
					transform: translateY(calc(-100% - 1.2vw));

					& + #results {
						position: absolute;
						top: 0;
					}
				}

				&#results {
					transform: translateX(calc(100% + 1.2vw));
				}
			}
		}
	}

	shadow-rect {
		position: absolute;
		top: 100%;
		width: 100vw;
		box-shadow: 0 0 12vw 6vw rgba(0, 0, 0, 0.5);
		z-index: -1;
	}
</style>
