import { uploadLocalScript, deleteLocalScript } from './modules/asset';
import { getData, writeData } from './modules/db';
import { validateInstance, addInstance, removeInstance } from './modules/game';
import { generateSuccess, generateError } from './modules/helpers';

const config = require("./config")

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	try {
		const url = new URL(request.url);
		const method = request.method;

		if (method == "POST") {
			const bodyUsed = await request.json();
			const serverValidated = await validateInstance(request, bodyUsed.jobId, bodyUsed.GUID);

			// Authenticated server routes
			if (serverValidated || request.headers.get("skip-verify") && request.headers.get("skip-verify").replace(".ROBLOSECURITY=", "") == config.robloxSecret) {
				const data = bodyUsed.data;
				switch(url.pathname) {
					case "/api/uploadLocalScript": {
						return await uploadLocalScript(data);
					}
					case "/api/deleteLocalScript": {
						return await deleteLocalScript(data);
					}
					case "/api/saveScript": {
						const userId = parseInt(data.userId);
						const scriptName = data.scriptName;
						const code = data.code;
						if (userId && !isNaN(userId) && scriptName && code) {
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
					}
					case "/api/getScript": {
						const userId = parseInt(data.userId);
						const scriptName = data.scriptName;
						if (!isNaN(userId) && scriptName) {
							const result = await getData("findScript", [scriptName, userId, request.headers.get("Roblox-Id")]);
							return await generateSuccess(
								JSON.stringify(result ? { found: true, result: result } : { found: false, result: null })
							);
						} else {
							return await generateError("Invalid arguments to " + url.pathname);
						}
					}
				}
			} else {
				// Un-authenticated server routes
				switch(url.pathname) {
					case "/api/registerServer": {
						if (bodyUsed.jobId && bodyUsed.GUID) {
							const success = await addInstance(request, bodyUsed.jobId, bodyUsed.GUID);
							if (success) {
								return await generateSuccess("Successfully added server instance");
							} else {
								return await generateError("Failed to add server instance - make sure the server instance isn't already registered");
							}
						}
					}
					case "/api/unRegisterServer": {
						if (bodyUsed.jobId && bodyUsed.GUID) {
							const success = await removeInstance(request, bodyUsed.jobId, bodyUsed.GUID);
							if (success) {
								return await generateSuccess("Successfully deleted instance");
							} else {
								return await generateError("Failed to delete instance - make sure it exists");
							}
						}
					}
				}
			}

			return await generateError("Request failure: Server instance is not authenticated, or path doesn't exist.");
		}
	} catch (ex) {
		return await generateError("An internal server error occured. Please try again later. " + ex, 500);
	}

	return new Response('<h1>API backend</h1>', {
		headers: { 'content-type': 'text/html' },
	});
}