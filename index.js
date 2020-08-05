import { uploadScript } from './modules/asset';
import { getData, writeData } from './modules/db';
import { validateGame } from './modules/game';
import {generateSuccess, generateError } from './modules/helpers';

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	try {
		const url = new URL(request.url);
		const method = request.method;

		if (method == "POST") {
			const bodyUsed = await request.json();
			const jobIdFound = await validateGame(request.headers.get("cf-connecting-ip"), bodyUsed.jobId);
			if (jobIdFound) {
				if (url.pathname == "/post/uploadScript") {
					return await uploadScript(bodyUsed);
				} else if (url.pathname == "/post/saveScript") {
					const userId = parseInt(bodyUsed.userId);
					const scriptName = bodyUsed.scriptName;
					const code = bodyUsed.code;
					if (userId && userId != NaN && scriptName && code) {
						const exists = await getData("findScript", [scriptName, userId]);
						if (!(exists ? true : false)) {
							const success = await writeData('scripts', {
								userId: userId,
								scriptName: scriptName,
								code: code
							});

							return await generateSuccess("Successfully saved scripts");
						}

						return await generateError("Script already exists");
					} else {
						return await generateError("Invalid arguments to " + url.pathname);
					}
				} else if (url.pathname == "/post/getScript") {
					const userId = parseInt(bodyUsed.userId);
					const scriptName = bodyUsed.scriptName;
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