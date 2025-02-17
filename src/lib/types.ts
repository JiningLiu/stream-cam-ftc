export enum ResultsState {
	HIDDEN = 'HIDDEN',
	AWAITING = 'AWAITING',
	MINI = 'MINI',
	FULL = 'FULL'
}

export function resultsStatusIsAwait(current: ResultsState): boolean {
	return current == ResultsState.AWAITING;
}

export function resultsStatusIsNotFull(current: ResultsState): boolean {
	return current != ResultsState.FULL;
}

export function resultsStatusIsHidden(current: ResultsState): boolean {
	return current == ResultsState.HIDDEN;
}
