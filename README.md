# Script Builder Backend

This is the backend repository for the Script Builder project located here:

https://github.com/mrparkerlol/script-builder

This handles the local scripts, as well as sandboxing module scripts (coming soon).

Requires the following prerequisites:

- A Cloudflare account (https://cloudflare.com)
- A Cloudflare Workers worker (free - 100k requests a day - https://workers.dev)
- Wrangler CLI tool (https://developers.cloudflare.com/workers/tooling/wrangler/install)
- Node toolchains (used to install Wrangler) (https://nodejs.org/en)
- NodeJS for installing dependencies (https://nodejs.org/en)
- A FaunaDB account for storing created scripts (https://fauna.com)
- A Roblox account dedicated to uploading the local scripts, sandboxing module scripts and for validating API requests (https://roblox.com/)

The project has the following dependencies:

- FaunaDB (for script storage) (https://www.npmjs.com/package/faunadb)

An example config.js:

```
module.exports = {
	robloxSecret: "_|WARNING:-DO-NOT-SHARE-THIS...", // .ROBLOSECURITY cookie for alternate account
	faunaSecret: "abcdefghijklmnopqrstuvwxyz1234567890", // Secret for FaunaDB
}
```

An example wrangler.toml:

```
compatibility_date = "2022-09-14"
name = "script-builder-backend"
account_id = "abc123"
workers_dev = true
route = { pattern = "*", zone_id = "abc123" }
main = "./index"
node_compat = true
```