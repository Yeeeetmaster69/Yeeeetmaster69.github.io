
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import { Expo } from 'expo-server-sdk';
import { randomUUID } from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const expo = new Expo();
const corsHandler = cors({ origin: true });

export const setRoleClaim = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const { uid, role } = req.body;
      if (!uid || !role) return res.status(400).send('uid/role required');
      await auth.setCustomUserClaims(uid, { role });
      await auth.revokeRefreshTokens(uid);
      res.send('ok');
    }catch(e:any){
      res.status(500).send(e.message);
    }
  });
});

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const ref = db.doc(`users/${user.uid}`);
  const snap = await ref.get();
  if (!snap.exists) await ref.set({ email: user.email, role: 'client', createdAt: Date.now() });
  await auth.setCustomUserClaims(user.uid, { role: 'client' });
});

export const broadcast = functions.https.onRequest((req,res)=>{
  return corsHandler(req, res, async () => {
    try{
      const { message } = req.body;
      if (!message) return res.status(400).send('message required');
      const tokensSnap = await db.collection('pushTokens').get();
      const messages: any[] = [];
      tokensSnap.forEach(doc=>{
        const token = doc.data().token;
        if (Expo.isExpoPushToken(token)) {
          messages.push({ to: token, sound: 'default', body: message });
        }
      });
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) { await expo.sendPushNotificationsAsync(chunk); }
      res.send('sent');
    }catch(e:any){ res.status(500).send(e.message) }
  });
});

// --- Square endpoints ---
function makeClient(): any {
  const token = (functions.config().square && functions.config().square.token) || process.env.SQUARE_ACCESS_TOKEN;
  const env = (functions.config().square && functions.config().square.env) || process.env.SQUARE_ENV || 'sandbox';
  if (!token)
    throw new Error('Square token missing. Set via: firebase functions:config:set square.token="..."; square.env="production|sandbox"; square.location_id="..."');
  const environment = env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
   return new SquareClient({ token, environment }) as any;
}

async function getLocationId(client: any): Promise<string> {
  // Prefer configured location id
  const cfgLoc = (functions.config().square && functions.config().square.location_id) || process.env.SQUARE_LOCATION_ID;
  if (cfgLoc) return cfgLoc;
  // Fallback to first active location
  const loc = await client.locations.list();
  const first = loc.data?.[0];
  if (!first?.id) throw new Error('No Square locations found on the account');
  return first.id;
}

// Create or fetch a Square Customer for a given email/name and store mapping in Firestore /users/{uid}
export const sqUpsertCustomer = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const client = makeClient();
      const { uid, email, givenName, familyName, phone } = req.body;
      if (!email) return res.status(400).send('email required');
      const customers = await client.customers.search({ query: { filter: { emailAddress: { exact: email }}}});
      let customer = customers.data?.customers?.[0];
      if (!customer){
        const created = await client.customers.create({
          body: { emailAddress: email, givenName, familyName, phoneNumber: phone }
        });
        customer = created.data?.customer!;
      }
      if (uid) {
        await db.doc(`users/${uid}`).set({ squareCustomerId: customer.id }, { merge: true });
      }
      res.send({ customer });
    }catch(e:any){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
});

// Create a DRAFT Invoice (acts as an "estimate") from arbitrary line items; do not publish
export const sqCreateEstimate = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const client = makeClient();
      const { customerId, items, memo } : { customerId: string, items: Array<{ name:string, quantity:string, amountCents:number }>, memo?: string } = req.body;
      if (!customerId || !Array.isArray(items) || items.length === 0) return res.status(400).send('customerId and items required');
      const locationId = await getLocationId(client);

      const createOrder = await client.orders.create({
        body: {
          idempotencyKey: randomUUID(),
          order: {
            locationId,
            referenceId: (req.body && req.body.jobId) || undefined,
            lineItems: items.map(i => ({
              name: i.name,
              quantity: i.quantity,
              basePriceMoney: { amount: BigInt(Math.trunc(i.amountCents)), currency: 'USD' }
            }))
          }
        }
      });

      const orderId = createOrder.data?.order?.id!;
      const inv = await client.invoices.create({
        body: {
          idempotencyKey: randomUUID(),
          invoice: {
            locationId,
            orderId,
            title: 'Estimate',
            description: memo || 'Estimate',
            deliveryMethod: 'EMAIL',
            primaryRecipient: { customerId }
          }
        }
      });

      // Return DRAFT invoice (not published)
      res.send({ invoice: inv.data?.invoice });
    }catch(e:any){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
});

// Create & Publish an Invoice (sends email/SMS depending on settings)
export const sqCreateAndSendInvoice = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const client = makeClient();
      const { customerId, items, memo, dueDate } : { customerId: string, items: Array<{ name:string, quantity:string, amountCents:number }>, memo?: string, dueDate?: string } = req.body;
      if (!customerId || !Array.isArray(items) || items.length === 0) return res.status(400).send('customerId and items required');
      const locationId = await getLocationId(client);

      const orderRes = await client.orders.create({
        body: {
          idempotencyKey: randomUUID(),
          order: {
            locationId,
            referenceId: (req.body && req.body.jobId) || undefined,
            lineItems: items.map(i => ({
              name: i.name,
              quantity: i.quantity,
              basePriceMoney: { amount: BigInt(Math.trunc(i.amountCents)), currency: 'USD' }
            }))
          }
        }
      });
      const orderId = orderRes.data?.order?.id!;

      const invoiceRes = await client.invoices.create({
        body: {
          idempotencyKey: randomUUID(),
          invoice: {
            locationId,
            orderId,
            title: 'Invoice',
            description: memo || 'Invoice',
            primaryRecipient: { customerId },
            deliveryMethod: 'EMAIL',
            paymentRequests: [
              {
                requestType: 'BALANCE',
                dueDate: dueDate, // e.g., '2025-09-01'
                reminders: [{ relativeScheduledDays: -1, message: 'Reminder: Invoice due tomorrow.' }]
              }
            ]
          }
        }
      });

      const invoice = invoiceRes.data?.invoice!;
      const publishRes = await client.invoices.publish({ invoiceId: invoice.id!, body: { version: invoice.version! }});
      res.send({ invoice: publishRes.data?.invoice });
    }catch(e:any){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
});

// Publish an existing draft invoice by ID
export const sqPublishInvoice = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const client = makeClient();
      const { invoiceId, version } = req.body;
      if (!invoiceId) return res.status(400).send('invoiceId required');
      const inv = await client.invoices.publish({ invoiceId, body: { version: BigInt(version || 1) } });
      res.send({ invoice: inv.data?.invoice });
    }catch(e:any){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
});

// Create a hosted checkout link (alternative to invoices)
export const sqCreatePaymentLink = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try{
      const client = makeClient();
      const { name, amountCents, quantity } = req.body;
      const locationId = await getLocationId(client);
      const r = await client.checkout.createPaymentLink({
        body: {
          idempotencyKey: randomUUID(),
          quickPay: {
            name,
            priceMoney: { amount: BigInt(Math.trunc(amountCents)), currency: 'USD' },
            locationId,
            quantity: quantity ? String(quantity) : '1'
          }
        }
      });
      res.send({ url: r.data?.paymentLink?.url });
    }catch(e:any){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
});

// --- Square Webhook (invoice/payment status) ---
export const squareWebhook = functions.https.onRequest(async (req, res) => {
  // Verify signature (HMAC-SHA256)
  try {
    const secret = (functions.config().square && functions.config().square.webhook_secret) || process.env.SQUARE_WEBHOOK_SECRET;
    if (!secret) {
      res.status(500).send('webhook_secret not configured');
      return;
    }
    const signature = req.get('x-square-hmacsha256-signature');
    const bodyRaw = (req as any).rawBody || JSON.stringify(req.body);
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(bodyRaw);
    const digest = hmac.digest('base64');
    if (signature !== digest) {
      console.error('Bad signature');
      res.status(401).send('invalid signature');
      return;
    }

    const ev = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const type = ev?.type || ev?.event_type || '';
    const data = ev?.data?.object || ev?.data || {};

    // Handle invoice and payment events
    if (type.startsWith('invoice.') || type.startsWith('invoices.')) {
      const inv = data?.invoice || data;
      const invoiceId = inv?.id;
      const orderId = inv?.orderId || inv?.order_id;
      const status = inv?.status || inv?.invoice?.status;
      if (orderId) {
        // Find job by stored orderId OR by referenceId on the order (preferred)
        // We store jobId in order.referenceId when creating order
        try {
          // best: lookup job by stored invoiceId or orderId fields
          const jobsRef = db.collection('jobs').where('orderId', '==', orderId);
          const qs = await jobsRef.get();
          if (!qs.empty) {
            for (const d of qs.docs) {
              await d.ref.set({ invoiceId, orderId, invoiceStatus: status }, { merge: true });
            }
          }
        } catch(e){ console.error('Job update error', e); }
      }
    } else if (type.startsWith('payment.')) {
      const p = data?.payment || data;
      const orderId = p?.orderId || p?.order_id;
      const status = p?.status;
      if (orderId) {
        try {
          const jobsRef = db.collection('jobs').where('orderId', '==', orderId);
          const qs = await jobsRef.get();
          if (!qs.empty) {
            for (const d of qs.docs) {
              await d.ref.set({ paymentStatus: status }, { merge: true });
              if (status === 'COMPLETED') {
                await d.ref.set({ status: 'done' }, { merge: true });
              }
            }
          }
        } catch(e){ console.error('Payment job update error', e); }
      }
    }

    res.send('ok');
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
});
