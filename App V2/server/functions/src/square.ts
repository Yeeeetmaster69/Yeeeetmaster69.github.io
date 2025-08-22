import * as functions from 'firebase-functions';
import { SquareClient, SquareEnvironment } from 'square';

export function makeClient(): any {
  const token = (functions.config().square && functions.config().square.token) || process.env.SQUARE_ACCESS_TOKEN;
  const env = (functions.config().square && functions.config().square.env) || process.env.SQUARE_ENV || 'sandbox';
  if (!token)
    throw new Error('Square token missing. Set via: firebase functions:config:set square.token="..."; square.env="production|sandbox"; square.location_id="..."');
  const environment = env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
  return new SquareClient({ token, environment }) as any;
}

export async function getLocationId(client: any): Promise<string> {
  const cfgLoc = (functions.config().square && functions.config().square.location_id) || process.env.SQUARE_LOCATION_ID;
  if (cfgLoc) return cfgLoc;
  const loc = await client.locations.list();
  const first = loc.data?.[0];
  if (!first?.id) throw new Error('No Square locations found on the account');
  return first.id;
}
