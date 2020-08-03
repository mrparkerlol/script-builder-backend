const rbxCookie = ""; // Insert your (non-main account) account's cookie here

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

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method;
  if (method == "POST") {
    if (url.pathname == "/post/uploadScript") {
      try {
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

        return new Response(await resp.text(), {
          headers: { 'content-type': 'text/html' },
        });
      } catch(ex) {
        return new Response(ex, {
          headers: { 'content-type': 'text/json' },
        });
      }
    }
  }

  return new Response('<b>API backend</b>', {
    headers: { 'content-type': 'text/html' },
  });
}