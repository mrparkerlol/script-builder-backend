# Script Builder Backend

This is the backend repository for the Script Builder project located here:

https://github.com/mrteenageparker/script-builder

This handles the local scripts, as well as sandboxing module scripts (coming soon).

Requires the following prerequisites:

- A Cloudflare account (https://cloudflare.com)
- A Cloudflare Workers worker (free - 100k requests a day - https://workers.dev)
- Wrangler CLI tool (https://developers.cloudflare.com/workers/tooling/wrangler/install)
- Rust or Node toolchains (required by Wrangler) (https://www.rust-lang.org or https://nodejs.org/en)
- NodeJS for installing dependencies (https://nodejs.org/en)
- A FaunaDB account (https://fauna.com)

The project has the following dependencies:

- FaunaDB (https://www.npmjs.com/package/faunadb)

An example config.js:

```
module.exports = {
	robloxSecret: "", // .ROBLOSECURITY cookie for alternate account
	fauanaSecret: "" // Secret for faunaDB
}
```