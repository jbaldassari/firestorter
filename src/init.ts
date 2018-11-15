import { app, firestore } from "firebase";

let globalFirebase: any;
let globalFirebaseApp: app.App;
let globalFirestore: firestore.Firestore;

/**
 * Initializes `firestorter` with the firebase-app.
 *
 * @param {Object} config - Configuration options
 * @param {Firebase} config.firebase - Firebase reference
 * @param {String|FirebaseApp} [config.app] - FirebaseApp to use (when omitted the default app is used)
 *
 * @example
 * import firebase from 'firebase';
 * import 'firebase/firestore';
 * import {initFirestorter, Collection, Document} from 'firestorter';
 *
 * // Initialize firebase app
 * firebase.initializeApp({...});
 *
 * // Initialize `firestorter`
 * initFirestorter({firebase: firebase});
 *
 * // Create collection or document
 * const albums = new Collection('artists/Metallica/albums');
 * ...
 * const album = new Document('artists/Metallica/albums/BlackAlbum');
 * ...
 */
function initFirestorter(config: {
	firebase: any;
	app?: string | app.App;
}): void {
	if (globalFirestore) {
		throw new Error(
			"Firestorter already initialized, did you accidentally call `initFirestorter()` again?"
		);
	}
	globalFirebase = config.firebase;
	globalFirebaseApp = config.app
		? typeof config.app === "string"
			? globalFirebase.app(config.app)
			: config.app
		: globalFirebase.app();
	globalFirestore = (globalFirebaseApp as any).firestore();
	if (!globalFirestore) {
		throw new Error(
			"firebase.firestore() returned `undefined`, did you forget `import 'firebase/firestore';`"
		);
	}
}

function getFirebase(): any {
	if (!globalFirebase) {
		throw new Error(
			"No firebase reference, did you forget to call `initFirestorter` ?"
		);
	}
	return globalFirebase;
}

function getFirebaseApp(): app.App {
	if (!globalFirebaseApp) {
		throw new Error(
			"No firebase app, did you forget to call `initFirestorter` ?"
		);
	}
	return globalFirebaseApp;
}

function getFirestore(): firestore.Firestore {
	if (!globalFirestore) {
		throw new Error(
			"No firestore reference, did you forget to call `initFirestorter` ?"
		);
	}
	return globalFirestore;
}

export { initFirestorter, getFirestore, getFirebase, getFirebaseApp };
