const config = require('../config');

const CSRFTokenUrl = "https://auth.roblox.com/v2/logout";
const renewAuthTicketURL = "https://www.roblox.com/authentication/signoutfromallsessionsandreauthenticate";

export async function getCSRFToken() {
    const resp = await fetch(new Request(CSRFTokenUrl), {
        method: "POST",
        headers: {
			"cookie": ".ROBLOSECURITY=" + config.robloxSecret,
			"connection": "keep-alive",
		}
    });

    return resp.status == 403 ? resp.headers.get('x-csrf-token') : null;
}

export async function renewAuthTicket() {
    const resp = await fetch(new Response(renewAuthTicketURL), {
        method: "POST",
        headers: {
            "cookie": ".ROBLOSECURITY=" + config.robloxSecret,
            "X-CSRF-TOKEN": await getCSRFToken(),
			"connection": "keep-alive",
		}
    });

    if (resp.status == 200) {
        const headers = resp.headers.values();
        for (let value of headers) {
            if (val.indexOf(".ROBLOSECURITY=") >= 0) {
                // TODO: cache using Workers KV in the future
                // and only renew once a week
                return value;
            }
        }
    }

    return null;
}