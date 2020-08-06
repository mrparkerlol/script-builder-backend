import { uploadScript } from './modules/asset';
import { getData, writeData } from './modules/db';
import { validateInstance, addInstance, removeInstance } from './modules/game';
import {generateSuccess, generateError } from './modules/helpers';
import { placeId } from './config';

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	try {
		const url = new URL(request.url);
		const method = request.method;

		if (method == "POST") {
			const bodyUsed = await request.json();
			const serverValidated = await validateInstance(request.headers.get("cf-connecting-ip"), bodyUsed.jobId, bodyUsed.GUID);
			if (serverValidated) {
				const data = bodyUsed.data;
				if (url.pathname == "/post/uploadScript") {
					return await uploadScript(data);
				} else if (url.pathname == "/post/saveScript") {
					const userId = parseInt(data.userId);
					const scriptName = data.scriptName;
					const code = data.code;
					if (userId && userId != NaN && scriptName && code) {
						const exists = await getData("findScript", [scriptName, userId]);
						if (!(exists ? true : false)) {
							const success = await writeData('scripts', {
								userId: userId,
								scriptName: scriptName,
								code: code
							});

							if (success) {
								return await generateSuccess("Successfully saved script");
							} else {
								return await generateError("Failed to save scripts");
							}
						}

						return await generateError("Script already exists");
					} else {
						return await generateError("Invalid arguments to " + url.pathname);
					}
				} else if (url.pathname == "/post/getScript") {
					const userId = parseInt(data.userId);
					const scriptName = data.scriptName;
					if (userId != NaN && scriptName) {
						const result = await getData("findScript", [scriptName, userId]);
						return await generateSuccess(
							JSON.stringify(result ? { found: true, result: result } : { found: false, result: null })
						);
					} else {
						return await generateError("Invalid arguments to " + url.pathname);
					}
				}
			} else {
				if (url.pathname == "/post/registerServer") {
					const robloxId = request.headers.get("roblox-id");
					if (robloxId == placeId && bodyUsed.jobId && bodyUsed.GUID) {
						const success = await addInstance(request.headers.get("cf-connecting-ip"), bodyUsed.jobId, bodyUsed.GUID);
						if (success) {
							return await generateSuccess("Successfully added server instance");
						} else {
							return await generateError("Failed to add server instance - future requests to this API backend will fail", 500);
						}
					}
				} else if (url.pathname == "/post/unRegisterServer") {
					const robloxId = request.headers.get("roblox-id");
					if (robloxId == placeId && bodyUsed.jobId && bodyUsed.GUID) {
						const success = await removeInstance(request.headers.get("cf-connecting-ip"), bodyUsed.jobId, bodyUsed.GUID);
						if (success) {
							return await generateSuccess("Successfully deleted instance");
						} else {
							return await generateError("Failed to delete instance - make sure it exists");
						}
					}
				}

				return await generateError("Unauthorized.", 401);
			}
		}
	} catch (ex) {
		return await generateError("An internal server error occured. Please try again later. " + ex, 500);
	}

	return new Response('<h1>API backend</h1>', {
		headers: { 'content-type': 'text/html' },
	});
}