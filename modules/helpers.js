export async function generateCodeBody(code) {
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
<ProtectedString name="Source"><![CDATA[return function()${code} end]]></ProtectedString>
<BinaryString name="Tags"></BinaryString>
</Properties>
</Item>
</Item>
</roblox>`;
}

export async function generateError(errorMessage, code) {
	return new Response(JSON.stringify({ error: true, message: errorMessage }), {
		status: code || 400,
		headers: {
			"content-type": "application/json"
		}
	});
}

export async function generateSuccess(message) {
	return new Response(JSON.stringify({ error: false, message: message }), {
		status: 200,
		headers: {
			"content-type": "application/json"
		}
	});
}