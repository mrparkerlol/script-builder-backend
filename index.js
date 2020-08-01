const rbxCookie = ""; // Insert your (non-main account) account's cookie here

async function generateCodeBody(code) {
  return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
  <Meta name="ExplicitAutoJoints">true</Meta>
  <External>null</External>
  <External>nil</External>
  <Item class="LocalScript" referent="RBX75A213463503497796DE9DF31173BC1A">
    <Properties>
      <BinaryString name="AttributesSerialize"></BinaryString>
      <bool name="Disabled">true</bool>
      <Content name="LinkedSource"><null></null></Content>
      <string name="Name">LocalScript</string>
      <string name="ScriptGuid">{db92dbf3-6bd6-4d3c-83c9-cc181ef77722}</string>
      <ProtectedString name="Source"><![CDATA[` + code + `]]></ProtectedString>
      <BinaryString name="Tags"></BinaryString>
    </Properties>
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