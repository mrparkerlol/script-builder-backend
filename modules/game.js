/*
	Written by Jacob (@monofur, https://github.com/mrteenageparker)

	Provides helper functions for validating game instances
	and providing helper functions for initializing game servers
	with the backend

	This file is integral for verifying requests made to the API
	and that they actually came from Roblox game servers
*/

import { getData, writeData, deleteData } from './db';

const config = require('../config');
const robloxSecret = config.robloxSecret;

/*
	async function validateInstance();

	Validates an instance of a game is a valid instance of the game
	with the Roblox website

	Primarily based off of rocheck (located: https://github.com/grilme99/RoCheck)
*/
export async function validateRunningInstance(ip, placeId, jobId) {
	try {
		// Fetch from the Roblox website whether or not the instance is valid
		const req = await fetch(new Request(`https://assetgame.roblox.com/Game/PlaceLauncher.ashx?request=RequestGameJob&placeId=${placeId}&gameId=${jobId}`), {
			method: "GET",
			headers: {
				"cookie": `.ROBLOSECURITY=${robloxSecret}; path=/; domain=.roblox.com;`,
				"referer": `https://www.roblox.com/games/${placeId}/`,
				"origin": "https://www.roblox.com",
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0",
				"connection": "keep-alive",
			}
		});

		// Convert to JSON
		const reqJSON = await req.json();

		// Did it return the joinScriptUrl?
		if (reqJSON && reqJSON.joinScriptUrl) {
			const joinScriptReq = await fetch(new Request(reqJSON.joinScriptUrl)); // We have to fetch the URL
			let joinScriptJSON = await joinScriptReq.text(); // Returns the text of the request
			joinScriptJSON = JSON.parse(joinScriptJSON.replace(/--.*\r\n/, '')); // This line is needed to prevent JSON parse errors
			// Validate the MachineAddress matches the request IP
			// Validating the JobID is a sanity check to make sure
			// it is really valid
			if (joinScriptJSON && joinScriptJSON.MachineAddress == ip && reqJSON.jobId == jobId) {
				return true;
			}
		}
	} catch(ex) {
		return ex; // Return the exception for debugging purposes
	}

	// Ultimately returns false if all checks above fail
	return false;
}

/*
	async function validateInstance();

	Validates whether or not the instance passed is valid or not
	with a GUID - specifically for already running instances

	The GUID is a secret created by a instance of the script builder
	it will not be readable and shouldn't be readable by any code
	running in it - this is what is protecting the backend
	from spoofed requests
*/
export async function validateInstance(ip, placeId, jobId, GUID) {
	// Checks if the instance exists on Roblox
	// If it does exist, further checks are made
	// to validate the server
	const validInstance = await validateRunningInstance(ip, placeId, jobId);
	if (validInstance) {
		// Checks with database for the instance
		// of the game, if it does exist, then it
		// will return true - or just return false
		// if it isn't valid
		const instanceExists = await getData("findInstance", [jobId, placeId, GUID, ip]);
		if (instanceExists && instanceExists.GUID == GUID && instanceExists.jobId == jobId && instanceExists.ip == ip) { // one final sanity check
			return true;
		}
	}

	// Ultimately returns false if it doesn't work
	return false;
}

/*
	async function addInstance();

	Adds a instance after validation to the
	database of known instances
*/
export async function addInstance(ip, placeId, jobId, GUID) {
	// Validate the instance first
	const validInstance = await validateRunningInstance(ip, placeId, jobId);
	if (validInstance) {
		const exists = await getData("findInstanceIsRegistered", [ip, placeId, jobId]);
		if (!exists) {
			// Write to the database with the given GUID
			const success = await writeData("servers", {
				"ip": ip,
				"placeId": placeId, 
				"jobId": jobId,
				"GUID": GUID
			});

			// Return true on success, return false on failure
			if (success) {
				return true;
			}
		}
	}

	return false;
}

/*
	async function removeInstance();

	Removes instance from backend - only should
	be called when the game is shutting down
	cause then subsequent requests will fail
*/
export async function removeInstance(ip, robloxId, jobId, GUID) {
	const deleted = await deleteData("findInstance", [jobId, robloxId, GUID, ip]);
	return deleted == true ? true : false;
}