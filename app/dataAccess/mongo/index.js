const DBManager = require('./dbManager');
class MongoClient {
	constructor() {
		this.dbManager = new DBManager();
	}

	async _execute(callback, releaseConnection=true) {
		let client;
		try {
			client = await this.dbManager.acquire();
			const result = await callback(client);
			if (releaseConnection) this.dbManager.release(client);
			return result;
		} catch (err) {
			if (client) this.dbManager.destroy(client);
			throw err;
		}
	}

	dropDatabase(database) {
		return this._execute(client => client.db(database).dropDatabase());
	}

	addUser(database, username, password, role) {
		return this._execute(client => client.db(database).addUser(username, password, {
			roles: [{
				db: database,
				role
			}]
		}));
	}

	removeUser(database, username) {
		return this._execute(client => client.db(database).removeUser(username));
	}

	createCollection(database, collection) {
		return this._execute(client => client.db(database).createCollection(collection));
	}

	insertOne(database, collection, document) {
		return this._execute(client => client.db(database).collection(collection).insertOne(document));
	}

	insertMany(database, collection, documents) {
		return this._execute(client => client.db(database).collection(collection).insertMany(documents));
	}

	save(database, collection, document) {
		return this._execute(client => client.db(database).collection(collection).save(document));
	}

	updateOne(database, collection, query, update, options = {}) {
		return this._execute(client => client.db(database).collection(collection).updateOne(query, update, options));
	}

	updateMany(database, collection, query, update, options = {}) {
		return this._execute(client => client.db(database).collection(collection).updateMany(query, update, options));
	}

	findOne(database, collection, filter, projection = {}) {
		return this._execute(client => client.db(database).collection(collection).findOne(filter, {
			projection
		}));
	}

	find(database, collection, filter, projection = {}, sort = {}, limit = 0, skip = 0) {
		return this._execute(client => client.db(database)
			.collection(collection)
			.find(filter, {
				projection
			})
			.sort(sort)
			.limit(limit)
			.skip(skip)
			.toArray());
	}

	deleteOne(database, collection, query) {
		return this._execute(client => client.db(database).collection(collection).deleteOne(query));
	}

	deleteMany(database, collection, query) {
		return this._execute(client => client.db(database).collection(collection).deleteMany(query));
	}

	findOneAndReplace(database, collection, filter, document, projection) {
		return this._execute(client => client.db(database).collection(collection).findOneAndReplace(filter, document, {
			projection
		}));
	}

	findOneAndUpdate(database, collection, filter, update, projection) {
		return this._execute(client => client.db(database).collection(collection).findOneAndUpdate(filter, update, {
			projection
		}));
	}

	findOneAndDelete(database, collection, filter, projection) {
		return this._execute(client => client.db(database).collection(collection).findOneAndDelete(filter, {
			projection
		}));
	}

	countDocuments(database, collection, query, options = {}) {
		return this._execute(client => client.db(database).collection(collection).countDocuments(query, options));
	}

	distinct(database, collection, field, query, options = {}) {
		return this._execute(client => client.db(database).collection(collection).distinct(field, query, options));
	}

	aggregate(database, collection, pipeline) {
		return this._execute(client => client.db(database).collection(collection).aggregate(pipeline).toArray());
	}

	getObjectId(id) {
		return this.dbManager.getObjectId(id);
	}

	isValidObjectId(id) {
		return this.dbManager.isValidObjectId(id);
	}

	watch(database, collection, pipeline = []) {
		return this._execute((client) => client.db(database).collection(collection).watch(pipeline), false);	
	}
}

module.exports = new MongoClient();
