import { observable, onBecomeObserved, onBecomeUnobserved } from "mobx";
import { IEnhancedObservableDelegate } from "./Types";

/**
 * @ignore
 * Creates an observable which calls addObserverRef &
 * releaseObserverRef methods on the passed-in delegate class.
 * Effecitively, this allows Firestorter to track whether
 * a Collection/Document is observed and real-time updating
 * needs to be enabled on it.
 */
export function enhancedObservable(
	data: any,
	delegate: IEnhancedObservableDelegate
): any {
	const o = Array.isArray(data) ? observable.array(data) : observable.box(data);

	// Hook into the MobX observable and track
	// Whether any Component is observing this observable.
	onBecomeObserved(o, undefined, delegate.addObserverRef);
	onBecomeUnobserved(o, undefined, delegate.releaseObserverRef);

	return o;
}
