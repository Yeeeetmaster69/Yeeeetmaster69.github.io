"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squareWebhook = exports.sqCreatePaymentLink = exports.sqPublishInvoice = exports.sqCreateAndSendInvoice = exports.sqCreateEstimate = exports.sqUpsertCustomer = exports.broadcast = exports.onUserCreate = exports.setRoleClaim = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const expo_server_sdk_1 = require("expo-server-sdk");
const crypto_1 = require("crypto");
const square_1 = require("./square");
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const expo = new expo_server_sdk_1.Expo();
const corsHandler = cors({ origin: true });
exports.setRoleClaim = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { uid, role } = req.body;
            if (!uid || !role)
                return res.status(400).send('uid/role required');
            await auth.setCustomUserClaims(uid, { role });
            await auth.revokeRefreshTokens(uid);
            res.send('ok');
        }
        catch (e) {
            res.status(500).send(e.message);
        }
    });
});
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const ref = db.doc(`users/${user.uid}`);
    const snap = await ref.get();
    if (!snap.exists)
        await ref.set({ email: user.email, role: 'client', createdAt: Date.now() });
    await auth.setCustomUserClaims(user.uid, { role: 'client' });
});
exports.broadcast = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { message } = req.body;
            if (!message)
                return res.status(400).send('message required');
            const tokensSnap = await db.collection('pushTokens').get();
            const messages = [];
            tokensSnap.forEach(doc => {
                const token = doc.data().token;
                if (expo_server_sdk_1.Expo.isExpoPushToken(token)) {
                    messages.push({ to: token, sound: 'default', body: message });
                }
            });
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                await expo.sendPushNotificationsAsync(chunk);
            }
            res.send('sent');
        }
        catch (e) {
            res.status(500).send(e.message);
        }
    });
});
exports.sqUpsertCustomer = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const client = (0, square_1.makeClient)();
            const { uid, email, givenName, familyName, phone } = req.body;
            if (!email)
                return res.status(400).send('email required');
            const customers = await client.customers.search({ query: { filter: { emailAddress: { exact: email } } } });
            let customer = customers.data?.customers?.[0];
            if (!customer) {
                const created = await client.customers.create({
                    body: { emailAddress: email, givenName, familyName, phoneNumber: phone }
                });
                customer = created.data?.customer;
            }
            if (uid) {
                await db.doc(`users/${uid}`).set({ squareCustomerId: customer.id }, { merge: true });
            }
            res.send({ customer });
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });
});
exports.sqCreateEstimate = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const client = (0, square_1.makeClient)();
            const { customerId, items, memo } = req.body;
            if (!customerId || !Array.isArray(items) || items.length === 0)
                return res.status(400).send('customerId and items required');
            const locationId = await (0, square_1.getLocationId)(client);
            const createOrder = await client.orders.create({
                body: {
                    idempotencyKey: (0, crypto_1.randomUUID)(),
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
            const orderId = createOrder.data?.order?.id;
            const inv = await client.invoices.create({
                body: {
                    idempotencyKey: (0, crypto_1.randomUUID)(),
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
            res.send({ invoice: inv.data?.invoice });
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });
});
exports.sqCreateAndSendInvoice = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const client = (0, square_1.makeClient)();
            const { customerId, items, memo, dueDate } = req.body;
            if (!customerId || !Array.isArray(items) || items.length === 0)
                return res.status(400).send('customerId and items required');
            const locationId = await (0, square_1.getLocationId)(client);
            const orderRes = await client.orders.create({
                body: {
                    idempotencyKey: (0, crypto_1.randomUUID)(),
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
            const orderId = orderRes.data?.order?.id;
            const invoiceRes = await client.invoices.create({
                body: {
                    idempotencyKey: (0, crypto_1.randomUUID)(),
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
                                dueDate: dueDate,
                                reminders: [{ relativeScheduledDays: -1, message: 'Reminder: Invoice due tomorrow.' }]
                            }
                        ]
                    }
                }
            });
            const invoice = invoiceRes.data?.invoice;
            const publishRes = await client.invoices.publish({ invoiceId: invoice.id, body: { version: invoice.version } });
            res.send({ invoice: publishRes.data?.invoice });
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });
});
exports.sqPublishInvoice = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const client = (0, square_1.makeClient)();
            const { invoiceId, version } = req.body;
            if (!invoiceId)
                return res.status(400).send('invoiceId required');
            const inv = await client.invoices.publish({ invoiceId, body: { version: BigInt(version || 1) } });
            res.send({ invoice: inv.data?.invoice });
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });
});
exports.sqCreatePaymentLink = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const client = (0, square_1.makeClient)();
            const { name, amountCents, quantity } = req.body;
            const locationId = await (0, square_1.getLocationId)(client);
            const r = await client.checkout.createPaymentLink({
                body: {
                    idempotencyKey: (0, crypto_1.randomUUID)(),
                    quickPay: {
                        name,
                        priceMoney: { amount: BigInt(Math.trunc(amountCents)), currency: 'USD' },
                        locationId,
                        quantity: quantity ? String(quantity) : '1'
                    }
                }
            });
            res.send({ url: r.data?.paymentLink?.url });
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });
});
exports.squareWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const secret = (functions.config().square && functions.config().square.webhook_secret) || process.env.SQUARE_WEBHOOK_SECRET;
        if (!secret) {
            res.status(500).send('webhook_secret not configured');
            return;
        }
        const signature = req.get('x-square-hmacsha256-signature');
        const bodyRaw = req.rawBody || JSON.stringify(req.body);
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
        if (type.startsWith('invoice.') || type.startsWith('invoices.')) {
            const inv = data?.invoice || data;
            const invoiceId = inv?.id;
            const orderId = inv?.orderId || inv?.order_id;
            const status = inv?.status || inv?.invoice?.status;
            if (orderId) {
                try {
                    const jobsRef = db.collection('jobs').where('orderId', '==', orderId);
                    const qs = await jobsRef.get();
                    if (!qs.empty) {
                        for (const d of qs.docs) {
                            await d.ref.set({ invoiceId, orderId, invoiceStatus: status }, { merge: true });
                        }
                    }
                }
                catch (e) {
                    console.error('Job update error', e);
                }
            }
        }
        else if (type.startsWith('payment.')) {
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
                }
                catch (e) {
                    console.error('Payment job update error', e);
                }
            }
        }
        res.send('ok');
    }
    catch (e) {
        console.error(e);
        res.status(500).send(e.message);
    }
});
//# sourceMappingURL=index.js.map