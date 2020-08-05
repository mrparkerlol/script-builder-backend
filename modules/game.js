/*
	Primarily based off of rocheck (located: https://github.com/grilme99/RoCheck)
*/

const config = require('../config');
const robloxSecret = config.robloxSecret;
const placeId = config.placeId;

export async function validateGame(ip, jobId) {
	try {
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
		const reqJSON = await req.json();
		if (reqJSON && reqJSON.joinScriptUrl) {
			const joinScriptReq = await fetch(new Request(reqJSON.joinScriptUrl));
			let joinScriptJSON = await joinScriptReq.text();
			joinScriptJSON = JSON.parse(joinScriptJSON.replace(/--.*\r\n/, ''));
			if (joinScriptJSON && joinScriptJSON.MachineAddress == ip && reqJSON.jobId == jobId) {
				return true;
			}
		}
	} catch(ex) {
		throw ex;
	}

	return false;
}