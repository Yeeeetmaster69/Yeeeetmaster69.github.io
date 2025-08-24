"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeClient = makeClient;
exports.getLocationId = getLocationId;
const functions = require("firebase-functions");
const square_1 = require("square");
function makeClient() {
    const token = (functions.config().square && functions.config().square.token) || process.env.SQUARE_ACCESS_TOKEN;
    const env = (functions.config().square && functions.config().square.env) || process.env.SQUARE_ENV || 'sandbox';
    if (!token)
        throw new Error('Square token missing. Set via: firebase functions:config:set square.token="..."; square.env="production|sandbox"; square.location_id="..."');
    const environment = env === 'production' ? square_1.SquareEnvironment.Production : square_1.SquareEnvironment.Sandbox;
    return new square_1.SquareClient({ token, environment });
}
async function getLocationId(client) {
    const cfgLoc = (functions.config().square && functions.config().square.location_id) || process.env.SQUARE_LOCATION_ID;
    if (cfgLoc)
        return cfgLoc;
    const loc = await client.locations.list();
    const first = loc.data?.[0];
    if (!first?.id)
        throw new Error('No Square locations found on the account');
    return first.id;
}
//# sourceMappingURL=square.js.map