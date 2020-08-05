const config = require('../config');
import { generateCodeBody } from './helpers';

export async function uploadScript(bodyUsed) {
	const code = await generateCodeBody(bodyUsed.code.toString());
	const assetId = bodyUsed.assetId.toString();
	const resp = await fetch(new Request("https://data.roblox.com/Data/Upload.ashx?json=1&assetid=" + assetId), {
		method: "POST",
		body: code,
		headers: {
			"cookie": ".ROBLOSECURITY=" + config.robloxSecret,
			"content-type": "application/xml",
			"content-length": code.length,
			"connection": "keep-alive",
		}
	});

	return resp.status == 200 ?
		await generateSuccess(await resp.text()) :
		await generateError(await resp.text());
}

export async function getModule(bodyUsed) {
	throw "Not implemented yet";
}