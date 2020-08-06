const config = require('./../config');

// FaunaDB configuration & setup
var faunadb = require('faunadb'),
	q = faunadb.query;

export const client = new faunadb.Client({
	secret: config.faunaSecret,
	fetch: fetch.bind(globalThis)
});

/*
	async function getData()
	Returns data matching the object passed into the function
*/
export async function getData(index, object) {
	try {
		var result = await client.query(
			q.Get(
				q.Match(
					q.Index(index), object
				)
			)
		);

		return result.data ? result.data : null;
	} catch(ex) {
		return false;
	}
}

/*
	async function writeData()
	Constructs a basic write query
*/
export async function writeData(collection, data) {
	try {
		await client.query(
			q.Create(
				q.Collection(collection),
				{
					data: data,
				}
			)
		);

		return true;
	} catch(ex) {
		return ex;
	}
}

/*
	async function deleteData();
	Deletes data at specified index
*/
export async function deleteData(index, data) {
	try {
	    var data = await client.query(
			q.Get(
				q.Match(
					q.Index(index), data
				)
			)
		);

		if (data) {
			const ref = data.ref;
			await client.query(
				q.Delete(
					q.Ref(
						q.Collection("servers"),
						ref.value.id
					)
				)
			)

			return true;
		} else {
			return false;
		}
	} catch(ex) {
		return ex;
	}
}