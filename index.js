const config = require('./config');
const rbxCookie = config.robloxSecret;
const faunaSecret = config.faunaSecret;

var faunadb = require('faunadb'),
	q = faunadb.query;

var client = new faunadb.Client({
	secret: faunaSecret,
	fetch: fetch.bind(globalThis)
});

async function generateCodeBody(code) {
	return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
<Meta name="ExplicitAutoJoints">true</Meta>
<External>null</External>
<External>nil</External>
<Item class="LocalScript" referent="RBX2160BD1F826C450A8F2B7E3AC77849C9">
<Properties>
<BinaryString name="AttributesSerialize"></BinaryString>
<bool name="Disabled">true</bool>
<Content name="LinkedSource"><null></null></Content>
<string name="Name">LocalScript</string>
<string name="ScriptGuid">{0E46D412-3104-4684-9119-9515C1822CF2}</string>
<ProtectedString name="Source"><![CDATA[local config = shared(script, getfenv());
local environment = config and config.environment;

local success, source = pcall(function()
	return require(script:WaitForChild("LSource"));
end);

script:ClearAllChildren();

if success then
	setfenv(0, environment);
	setfenv(1, environment);
	setfenv(source, environment);
	spawn(function()
		shared("Output", {
			Type = "general",
			Message = "Ran local script",
		});

		source();
	end);
else
	error(source, 0);
end;]]></ProtectedString>
<BinaryString name="Tags"></BinaryString>
</Properties>
<Item class="ModuleScript" referent="RBX066B198861FE488184CF42EEF7F3A894">
<Properties>
<BinaryString name="AttributesSerialize"></BinaryString>
<Content name="LinkedSource"><null></null></Content>
<string name="Name">LSource</string>
<string name="ScriptGuid">{85DF8BE5-8F00-4F18-9A2F-70F141465182}</string>
<ProtectedString name="Source"><![CDATA[return function()` + code + ` end]]></ProtectedString>
<BinaryString name="Tags"></BinaryString>
</Properties>
</Item>
</Item>
</roblox>`;
}

async function generateError(errorMessage) {
	return JSON.stringify({ error: true, message: errorMessage }), {
		status: 500,
		headers: {
			"content-type": "application/json"
		}
	};
}

async function generateSuccess(message) {
	return JSON.stringify({ error: false, message: message }), {
		status: 200,
		headers: {
			"content-type": "application/json"
		}
	};
}

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});

async function getData(index, object) {
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

async function handleRequest(request) {
	const url = new URL(request.url);
	const method = request.method;
	try {
		if (method == "POST") {
			if (url.pathname == "/post/uploadScript") {
				const bodyUsed = await request.json();
				const code = await generateCodeBody(bodyUsed.code.toString());
				const assetId = bodyUsed.assetId.toString();
				const resp = await fetch(new Request("https://data.roblox.com/Data/Upload.ashx?json=1&assetid=" + assetId), {
					method: "POST",
					body: code,
					headers: {
						"cookie": ".ROBLOSECURITY=" + rbxCookie,
						"content-type": "application/xml",
						"content-length": code.length,
						"connection": "keep-alive",
					}
				});

				return resp.status == 200 ?
					new Response(await generateSuccess(await resp.text())) :
					new Response(await generateError(await resp.text()));
			} else if (url.pathname == "/post/saveScript") {
				const bodyUsed = await request.json();
				const userId = parseInt(bodyUsed.userId);
				const scriptName = bodyUsed.scriptName;
				const code = bodyUsed.code;

				if (userId != NaN && scriptName && code) {
					const exists = await getData("findScript", [scriptName, userId]);
					if (!exists ? true : false) {
						await client.query(
							q.Create(
								q.Collection('scripts'),
								{
									data: {
										userId: userId,
										scriptName: scriptName,
										code: code
									}
								}
							)
						);

						return new Response(await generateSuccess("Successfully saved scripts"));
					}

					return new Response(await generateError("Script already exists"));
				} else {
					return new Response(await generateError("Invalid arguments to " + url.pathname));
				}
			} else if (url.pathname == "/post/getScript") {
				const bodyUsed = await request.json();
				const userId = parseInt(bodyUsed.userId);
				const scriptName = bodyUsed.scriptName;

				if (userId != NaN && scriptName) {
					const result = await getData("findScript", [scriptName, userId]);
					return new Response(await generateSuccess(
						JSON.stringify(result ? { found: true, result: result } : { found: false, result: null })
					));
				} else {
					return new Response(await generateError("Invalid arguments to " + url.pathname));
				}
			}
		}
	} catch(ex) {
		return new Response(await generateError(ex));
	}

	return new Response('<h1>API backend</h1>', {
		headers: { 'content-type': 'text/html' },
	});
}