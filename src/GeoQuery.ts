import {
	runInAction,
	observable,
	decorate,
	computed,
	IObservableValue
} from "mobx";
import { CollectionSource, ICollectionDocument } from "./Types";
import { IGeoRegion, getGeohashesForRegion } from "./GeoHash";
import AggregateCollection, {
	IAggregateCollectionOptions,
	IAggregateCollectionQuery
} from "./AggregateCollection";

export type GeoQueryRegion = IGeoRegion | (() => IGeoRegion | void) | void;
export type GeoQueryHash = string[];

export interface IGeoQueryQuery extends IAggregateCollectionQuery {
	geoHash: GeoQueryHash;
}

export interface IGeoQueryOptions<T>
	extends IAggregateCollectionOptions<T, IGeoQueryQuery> {
	region?: GeoQueryRegion;
	filterBy?: (doc: T, region?: IGeoRegion | void) => boolean;
}

/**
 * GeoQuery makes it possible to perform efficient geographical based queries
 * with the use of geo-hashes.
 *
 * In order to use GeoQuery, each document needs a `geohash` field stored in the
 * root of the document. The value of the `geohash` field should be a geo-hash
 * encoded using `encodeGeohash`.
 *
 * @extends AggregateCollection
 * @param {CollectionSource} [source] String-path, ref or function that returns a path or ref
 * @param {Object} [options] Configuration options
 * @param {IGeoRegion} [options.region] See `GeoQuery.region`
 *
 * @example
 *
 * const query = new GeoQuery('bookings', {
 *   region = {
 *     latitude: 51.45663,
 *     longitude: 5.223,
 *     latitudeDelta: 0.1,
 *     longitudeDelta: 0.1,
 *   }
 * });
 *
 * // Bookings needs to contain documents with a `geohash`
 * // field in the root, like this:
 * // {
 * //   ...
 * //   geohash: 'jhdb23'
 * //   ...
 * // }
 *
 * autorun(() => {
 *   query.docs.map(doc => console.log('doc: ', doc.id, doc.data));
 * });
 */
class GeoQuery<T extends ICollectionDocument> extends AggregateCollection<
	T,
	IGeoQueryQuery
> {
	private regionObservable: IObservableValue<GeoQueryRegion>;

	constructor(source: CollectionSource, options: IGeoQueryOptions<T>) {
		const { region, filterBy, ...otherOptions } = options;
		const regionObservable = observable.box(region);
		super(source, {
			filterBy: filterBy
				? (doc: T) => {
						let regionVal = regionObservable.get();
						regionVal =
							typeof regionVal === "function" ? regionVal() : regionVal;
						return filterBy(doc, regionVal);
				  }
				: undefined,
			queries: () => {
				let regionVal = regionObservable.get();
				regionVal = typeof regionVal === "function" ? regionVal() : regionVal;
				const geoHashes = regionVal
					? getGeohashesForRegion(regionVal)
					: undefined;
				if (!geoHashes) {
					return null;
				}
				return geoHashes.map(geoHash => ({
					geoHash,
					key: `${geoHash[0]}-${geoHash[1]}`,
					query: ref =>
						ref
							.where("geoHash", ">=", geoHash[0])
							.where("geoHash", "<", geoHash[1])
				}));
			},
			...otherOptions
		});
		this.regionObservable = regionObservable;
	}

	/**
	 * Geographical region to query for.
	 *
	 * Use this property to get or set the region in which
	 * to perform a aggregate geohash query.
	 *
	 * @type {GeoQueryRegion}
	 *
	 * @example
	 * const query = new GeoQuery('bookings');
	 *
	 * // Bookings needs to contain documents with a `geohash`
	 * // field in the root, like this:
	 * // {
	 * //   ...
	 * //   geohash: 'jhdb23'
	 * //   ...
	 * // }
	 *
	 * ...
	 * // Set the region to query for
	 * query.region = {
	 *   latitude: 51.45663,
	 *   longitude: 5.223,
	 *   latitudeDelta: 0.1,
	 *   longitudeDelta: 0.1,
	 * }
	 */
	get region(): GeoQueryRegion {
		return this.regionObservable.get();
	}
	set region(val: GeoQueryRegion) {
		runInAction(() => this.regionObservable.set(val));
	}

	/**
	 * Geo-hashes that are queries for the given region.
	 *
	 * @type {GeoQueryHash[]}
	 *
	 * @example
	 * const query = new GeoQuery('bookings', {
	 *   region: {
	 *     latitude: 51.45663,
	 *     longitude: 5.223,
	 *     latitudeDelta: 0.1,
	 *     longitudeDelta: 0.1
	 *   }
	 * });
	 * ...
	 * // Get the in-use geohashes
	 * console.log(query.geohashes);
	 * // [['todo', 'todo2], ...]
	 */
	get geohashes(): GeoQueryHash[] {
		const queries = this.queries();
		return queries ? queries.map(query => query.geoHash) : [];
	}
}

decorate(GeoQuery, { geohashes: computed });

export default GeoQuery;
