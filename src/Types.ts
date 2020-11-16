import firebase from "firebase";
import "firebase/firestore";
import { IContext } from "./init";

/**
 * Document Source.
 */
export type DocumentSource =
	| firebase.firestore.DocumentReference
	| string
	| (() => firebase.firestore.DocumentReference | string | undefined)
	| undefined;

/**
 * Document options.
 */
export interface IDocumentOptions {
	schema?: any;
	snapshot?: firebase.firestore.DocumentSnapshot;
	snapshotOptions?: firebase.firestore.SnapshotOptions;
	mode?: Mode;
	debug?: boolean;
	debugName?: string;
	context?: IContext;
}

/**
 * Document interface.
 */
export interface IDocument {
	readonly id: string | undefined;
}

/**
 * Collection interface.
 */
export interface ICollection<T> {
	readonly docs: T[];
	readonly hasDocs: boolean;
}

/**
 * Collection-source.
 */
export type CollectionSource =
	| firebase.firestore.CollectionReference
	| string
	| (() => firebase.firestore.CollectionReference | string | undefined);

/**
 * Collection-query.
 */
export type CollectionQuery =
	| ((
			ref: firebase.firestore.CollectionReference
	  ) => firebase.firestore.Query | null | undefined)
	| firebase.firestore.Query;

/**
 * Collection options.
 */
export interface ICollectionOptions<T> {
	query?: CollectionQuery;
	createDocument?: (source: DocumentSource, options: IDocumentOptions) => T;
	mode?: Mode;
	debug?: boolean;
	debugName?: string;
	minimizeUpdates?: boolean;
	initialLocalSnapshotDetectTime?: number;
	initialLocalSnapshotDebounceTime?: number;
	context?: IContext;
}

/**
 * Collection document.
 */
export interface ICollectionDocument extends IDocument {
	addCollectionRef(): number;
	releaseCollectionRef(): number;
	updateFromCollectionSnapshot(
		snapshot: firebase.firestore.DocumentSnapshot
	): void;
}

/**
 * Real-time updating mode.
 * @type Mode
 */
export enum Mode {
	Auto = "auto",
	On = "on",
	Off = "off"
}

/**
 * @private
 */
export interface IEnhancedObservableDelegate {
	addObserverRef(): number;
	releaseObserverRef(): number;
}
