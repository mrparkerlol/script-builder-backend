const config = require('../config');
import { getCSRFToken } from './auth';
import { generateModularCodeBody, generateNonModularCodeBody, generateSuccess, generateError, generateDefaultScriptBody } from './helpers';

const baseUploadURL = `https://data.roblox.com/Data/Upload.ashx?json=1`;
const defaultCode = generateDefaultScriptBody();

/*
	async function uploadLocalScript();
	Uploads a local script with the given information.
	It auto-decides based on asset id whether or not
	to make a new model or not.

	If asset id is 0, it will create a new model
	If asset id is not equal to zero, it will attempt
	to upload the given ID.
*/
export async function uploadLocalScript(bodyUsed) {
	let code = config.modular ? await generateModularCodeBody(bodyUsed.code) : await generateNonModularCodeBody(bodyUsed.code);
	let assetId = bodyUsed.assetId ? bodyUsed.assetId.toString() : "0";
	let isPublic = assetId != "0" ? "false" : "true";
	let url = assetId != "0" ? baseUploadURL + `&assetid=${assetId}` : baseUploadURL + `&assetid=${assetId}&type=Model&genreTypeId=1&name=Model&description=Model&ispublic=${isPublic}&allowcomments=true`
	const resp = await fetch(new Request(url), {
		method: "POST",
		body: code,
		headers: {
			"cookie": ".ROBLOSECURITY=" + config.robloxSecret,
			"X-CSRF-TOKEN": await getCSRFToken(),
			"content-type": "application/xml",
			"content-length": code.length,
			"connection": "keep-alive",
		}
	});

	return resp.status == 200 ?
		await generateSuccess(await resp.text()) : await generateError(await resp.text());
}

export async function deleteLocalScript(bodyUsed) {
	let assetId = bodyUsed.assetId;
	if (assetId) {
		const overwriteScriptResponse = await fetch(new Request(baseUploadURL + `&assetid=${assetId}`), {
			method: "POST",
			body: defaultCode,
			headers: {
				"cookie": ".ROBLOSECURITY=" + config.robloxSecret,
				"X-CSRF-TOKEN": await getCSRFToken(),
				"content-type": "application/xml",
				"content-length": defaultCode.length,
				"connection": "keep-alive",
			}
		});

		if (overwriteScriptResponse.status == 200) {
			const resp = await fetch(new Request(`https://develop.roblox.com/v1/assets/${assetId}`), {
				method: "PATCH",
				body: JSON.stringify({
					isCopyingAllowed: false,
				}),
				headers: {
					"cookie": ".ROBLOSECURITY=" + config.robloxSecret,
					"X-CSRF-TOKEN": await getCSRFToken(),
					"content-type": "application/json" 
				}
			});
			
			return resp.status == 200 ?
				await generateSuccess(await resp.text()) : await generateError(await resp.text() + await getCSRFToken());
		}
	}
}

export async function getAsset(bodyUsed) {
	throw "Not implemented yet";
}
