export async function generateNonModularCodeBody(code) {
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

export async function generateModularCodeBody(code) {
	return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="ModuleScript" referent="RBX921E7678168A4A57908A5F8D0005AE7B">
		<Properties>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<Content name="LinkedSource"><null></null></Content>
			<string name="Name">MainModule</string>
			<string name="ScriptGuid">{F01216B8-39BD-4ED9-8AB4-B71BD4DB09B6}</string>
			<ProtectedString name="Source">return script:WaitForChild(&quot;LocalScript&quot;);</ProtectedString>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
		<Item class="LocalScript" referent="RBX5D75A82EE66045809541E1A5ED75BFD3">
			<Properties>
				<BinaryString name="AttributesSerialize"></BinaryString>
				<bool name="Disabled">true</bool>
				<Content name="LinkedSource"><null></null></Content>
				<string name="Name">LocalScript</string>
				<string name="ScriptGuid">{62199F6D-ACC4-4B5C-A0FB-7151C81EB612}</string>
				<ProtectedString name="Source"><![CDATA[local code = nil;
(function()
	code = require(script:WaitForChild("LSource"));
	script:ClearAllChildren();
end)();

-- Allows for the use case
-- where shared is already defined, and
-- can't be overwritten.
local shared = shared;
if getmetatable(shared) ~= nil and shared.SB ~= nil then
	shared = shared.SB;
end;

if code then
	local config = shared(script, getfenv());
	local environment = config and config.environment;

	setfenv(0, environment);
	setfenv(1, environment);
	setfenv(code, environment);

	spawn(function()
		shared("Output", {
			Type = "general",
			Message = "Ran local script",
		});

		local success, message = pcall(function()
			code();
		end);

		if not success then
			error(message);
		end;
	end);
end;]]></ProtectedString>
				<int64 name="SourceAssetId">-1</int64>
				<BinaryString name="Tags"></BinaryString>
			</Properties>
			<Item class="ModuleScript" referent="RBXCD3EFA7D195249FA99CFB6E3388AFFCE">
				<Properties>
					<BinaryString name="AttributesSerialize"></BinaryString>
					<Content name="LinkedSource"><null></null></Content>
					<string name="Name">LSource</string>
					<string name="ScriptGuid"></string>
					<ProtectedString name="Source"><![CDATA[return function()${code} end;]]></ProtectedString>
					<int64 name="SourceAssetId">-1</int64>
					<BinaryString name="Tags"></BinaryString>
				</Properties>
			</Item>
		</Item>
	</Item>
</roblox>`;
}

export function generateDefaultScriptBody() {
	return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="LocalScript" referent="RBX8F1898E19EB14A1E8C32432994345681">
		<Properties>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<bool name="Disabled">false</bool>
			<Content name="LinkedSource"><null></null></Content>
			<string name="Name">LocalScript</string>
			<string name="ScriptGuid">{E7471891-8A97-443C-8AD6-CA6706FA96DF}</string>
			<ProtectedString name="Source">print(&quot;Hello world!&quot;)</ProtectedString>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
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