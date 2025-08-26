"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscriptionRenewals = exports.updateSubscriptionAfterJobCompletion = exports.manualGenerateSubscriptionJobs = exports.generateSubscriptionJobs = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
function calculateNextJobDate(subscription) {
    const frequency = subscription.customFrequency || 'weekly';
    const startDate = subscription.lastJobDate || subscription.startDate;
    const date = new Date(startDate);
    switch (frequency) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'semi-annual':
            date.setMonth(date.getMonth() + 6);
            break;
        default:
            date.setDate(date.getDate() + 7);
    }
    if (subscription.preferredDayOfWeek !== undefined) {
        const dayDiff = subscription.preferredDayOfWeek - date.getDay();
        if (dayDiff !== 0) {
            date.setDate(date.getDate() + (dayDiff > 0 ? dayDiff : dayDiff + 7));
        }
    }
    return date.getTime();
}
function getTimeSlotHour(timeSlot) {
    switch (timeSlot) {
        case 'morning': return 9;
        case 'afternoon': return 13;
        case 'evening': return 17;
        default: return 9;
    }
}
exports.generateSubscriptionJobs = functions.pubsub
    .schedule('0 6 * * *')
    .timeZone('America/New_York')
    .onRun(async (context) => {
    console.log('Starting subscription job generation...');
    try {
        const now = Date.now();
        const lookAheadDays = 3;
        const lookAheadTime = now + (lookAheadDays * 24 * 60 * 60 * 1000);
        const subscriptionsSnapshot = await db
            .collection('client_subscriptions')
            .where('status', '==', 'active')
            .where('nextJobDate', '<=', lookAheadTime)
            .get();
        console.log(`Found ${subscriptionsSnapshot.docs.length} subscriptions needing job generation`);
        const batch = db.batch();
        let jobsCreated = 0;
        for (const subDoc of subscriptionsSnapshot.docs) {
            const subscription = { id: subDoc.id, ...subDoc.data() };
            const planDoc = await db.collection('subscription_plans').doc(subscription.subscriptionPlanId).get();
            if (!planDoc.exists) {
                console.error(`Subscription plan ${subscription.subscriptionPlanId} not found`);
                continue;
            }
            const plan = { id: planDoc.id, ...planDoc.data() };
            const clientDoc = await db.collection('users').doc(subscription.clientId).get();
            if (!clientDoc.exists) {
                console.error(`Client ${subscription.clientId} not found`);
                continue;
            }
            const client = clientDoc.data();
            const existingJobsSnapshot = await db
                .collection('jobs')
                .where('subscriptionId', '==', subscription.id)
                .where('scheduledAt', '==', subscription.nextJobDate)
                .get();
            if (!existingJobsSnapshot.empty) {
                console.log(`Job already exists for subscription ${subscription.id} at ${new Date(subscription.nextJobDate)}`);
                continue;
            }
            const scheduledDate = new Date(subscription.nextJobDate);
            const hour = getTimeSlotHour(subscription.preferredTimeSlot || 'morning');
            scheduledDate.setHours(hour, 0, 0, 0);
            const job = {
                title: `${plan.name} - Recurring Service`,
                description: `Automated ${plan.frequency} service: ${(subscription.customServices || plan.services).join(', ')}`,
                address: client?.address || '',
                lat: client?.lat,
                lng: client?.lng,
                clientId: subscription.clientId,
                workerId: subscription.assignedWorkerId,
                status: 'upcoming',
                priority: 'medium',
                priceType: 'fixed',
                fixedPrice: subscription.customPrice || plan.basePrice,
                estimatedHours: plan.estimatedDuration / 60,
                scheduledAt: scheduledDate.getTime(),
                notes: subscription.specialInstructions,
                createdAt: now,
                updatedAt: now,
                subscriptionId: subscription.id,
                isRecurring: true
            };
            const jobRef = db.collection('jobs').doc();
            batch.set(jobRef, job);
            const subJobRef = db.collection('subscription_jobs').doc();
            batch.set(subJobRef, {
                subscriptionId: subscription.id,
                clientId: subscription.clientId,
                jobId: jobRef.id,
                scheduledDate: scheduledDate.getTime(),
                status: 'scheduled',
                isAutoGenerated: true,
                generatedAt: now,
                sequence: subscription.totalJobsCompleted + 1
            });
            const nextJobDate = calculateNextJobDate(subscription);
            const subscriptionRef = db.collection('client_subscriptions').doc(subscription.id);
            batch.update(subscriptionRef, {
                nextJobDate,
                updatedAt: now
            });
            if (subscription.clientId) {
                const notificationRef = db.collection('notifications').doc();
                batch.set(notificationRef, {
                    userId: subscription.clientId,
                    title: 'New Service Scheduled',
                    body: `Your ${plan.name} service has been scheduled for ${scheduledDate.toLocaleDateString()}`,
                    type: 'job',
                    isRead: false,
                    data: {
                        jobId: jobRef.id,
                        subscriptionId: subscription.id
                    },
                    createdAt: now
                });
            }
            jobsCreated++;
            console.log(`Created job for subscription ${subscription.id} scheduled for ${scheduledDate}`);
        }
        if (jobsCreated > 0) {
            await batch.commit();
            console.log(`Successfully created ${jobsCreated} subscription jobs`);
        }
        else {
            console.log('No new subscription jobs needed');
        }
        return { success: true, jobsCreated };
    }
    catch (error) {
        console.error('Error generating subscription jobs:', error);
        throw error;
    }
});
exports.manualGenerateSubscriptionJobs = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can manually generate subscription jobs');
    }
    try {
        console.log('Manual subscription job generation triggered by admin:', context.auth.uid);
        const subscriptionsSnapshot = await db
            .collection('client_subscriptions')
            .where('status', '==', 'active')
            .get();
        console.log(`Found ${subscriptionsSnapshot.docs.length} active subscriptions`);
        const batch = db.batch();
        let jobsCreated = 0;
        const now = Date.now();
        for (const subDoc of subscriptionsSnapshot.docs) {
            const subscription = { id: subDoc.id, ...subDoc.data() };
            const lookAheadTime = now + (7 * 24 * 60 * 60 * 1000);
            if (subscription.nextJobDate > lookAheadTime) {
                continue;
            }
            const planDoc = await db.collection('subscription_plans').doc(subscription.subscriptionPlanId).get();
            if (!planDoc.exists)
                continue;
            const plan = { id: planDoc.id, ...planDoc.data() };
            const clientDoc = await db.collection('users').doc(subscription.clientId).get();
            if (!clientDoc.exists)
                continue;
            const client = clientDoc.data();
            const existingJobsSnapshot = await db
                .collection('jobs')
                .where('subscriptionId', '==', subscription.id)
                .where('scheduledAt', '==', subscription.nextJobDate)
                .get();
            if (!existingJobsSnapshot.empty)
                continue;
            const scheduledDate = new Date(subscription.nextJobDate);
            const hour = getTimeSlotHour(subscription.preferredTimeSlot || 'morning');
            scheduledDate.setHours(hour, 0, 0, 0);
            const job = {
                title: `${plan.name} - Recurring Service`,
                description: `Manual ${plan.frequency} service: ${(subscription.customServices || plan.services).join(', ')}`,
                address: client?.address || '',
                lat: client?.lat,
                lng: client?.lng,
                clientId: subscription.clientId,
                workerId: subscription.assignedWorkerId,
                status: 'upcoming',
                priority: 'medium',
                priceType: 'fixed',
                fixedPrice: subscription.customPrice || plan.basePrice,
                estimatedHours: plan.estimatedDuration / 60,
                scheduledAt: scheduledDate.getTime(),
                notes: subscription.specialInstructions,
                createdAt: now,
                updatedAt: now,
                subscriptionId: subscription.id,
                isRecurring: true
            };
            const jobRef = db.collection('jobs').doc();
            batch.set(jobRef, job);
            const subJobRef = db.collection('subscription_jobs').doc();
            batch.set(subJobRef, {
                subscriptionId: subscription.id,
                clientId: subscription.clientId,
                jobId: jobRef.id,
                scheduledDate: scheduledDate.getTime(),
                status: 'scheduled',
                isAutoGenerated: false,
                generatedAt: now,
                sequence: subscription.totalJobsCompleted + 1
            });
            const nextJobDate = calculateNextJobDate(subscription);
            const subscriptionRef = db.collection('client_subscriptions').doc(subscription.id);
            batch.update(subscriptionRef, {
                nextJobDate,
                updatedAt: now
            });
            jobsCreated++;
        }
        if (jobsCreated > 0) {
            await batch.commit();
        }
        return { success: true, jobsCreated, message: `Created ${jobsCreated} subscription jobs` };
    }
    catch (error) {
        console.error('Error in manual subscription job generation:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate subscription jobs');
    }
});
exports.updateSubscriptionAfterJobCompletion = functions.firestore
    .document('jobs/{jobId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before?.status !== 'completed' && after?.status === 'completed' && after?.subscriptionId) {
        try {
            const subscriptionRef = db.collection('client_subscriptions').doc(after.subscriptionId);
            const subscriptionDoc = await subscriptionRef.get();
            if (subscriptionDoc.exists) {
                const subscription = subscriptionDoc.data();
                await subscriptionRef.update({
                    totalJobsCompleted: subscription.totalJobsCompleted + 1,
                    totalAmount: subscription.totalAmount + (after.totalCost || after.fixedPrice || 0),
                    lastJobDate: after.completedAt || Date.now(),
                    updatedAt: Date.now()
                });
                const subJobSnapshot = await db
                    .collection('subscription_jobs')
                    .where('jobId', '==', context.params.jobId)
                    .get();
                if (!subJobSnapshot.empty) {
                    const subJobDoc = subJobSnapshot.docs[0];
                    await subJobDoc.ref.update({
                        status: 'completed'
                    });
                }
                console.log(`Updated subscription ${after.subscriptionId} after job completion`);
            }
        }
        catch (error) {
            console.error('Error updating subscription after job completion:', error);
        }
    }
});
exports.checkSubscriptionRenewals = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('America/New_York')
    .onRun(async (context) => {
    console.log('Checking subscription renewals...');
    try {
        const now = Date.now();
        const endingSoonTime = now + (7 * 24 * 60 * 60 * 1000);
        const endingSubscriptions = await db
            .collection('client_subscriptions')
            .where('status', '==', 'active')
            .where('endDate', '<=', endingSoonTime)
            .where('endDate', '>', now)
            .get();
        const batch = db.batch();
        let batchOperations = 0;
        for (const subDoc of endingSubscriptions.docs) {
            const subscription = { id: subDoc.id, ...subDoc.data() };
            if (subscription.autoRenewal) {
                const newEndDate = subscription.endDate ? subscription.endDate + (365 * 24 * 60 * 60 * 1000) : undefined;
                batch.update(subDoc.ref, {
                    endDate: newEndDate,
                    updatedAt: now
                });
                batchOperations++;
                const notificationRef = db.collection('notifications').doc();
                batch.set(notificationRef, {
                    userId: subscription.clientId,
                    title: 'Subscription Auto-Renewed',
                    body: 'Your subscription has been automatically renewed for another year.',
                    type: 'system',
                    isRead: false,
                    data: {
                        subscriptionId: subscription.id
                    },
                    createdAt: now
                });
                batchOperations++;
            }
            else {
                const notificationRef = db.collection('notifications').doc();
                batch.set(notificationRef, {
                    userId: subscription.clientId,
                    title: 'Subscription Ending Soon',
                    body: 'Your subscription will end soon. Please contact us to renew.',
                    type: 'system',
                    isRead: false,
                    data: {
                        subscriptionId: subscription.id
                    },
                    createdAt: now
                });
                batchOperations++;
            }
        }
        const expiredSubscriptions = await db
            .collection('client_subscriptions')
            .where('status', '==', 'active')
            .where('endDate', '<=', now)
            .get();
        for (const subDoc of expiredSubscriptions.docs) {
            batch.update(subDoc.ref, {
                status: 'expired',
                updatedAt: now
            });
            batchOperations++;
        }
        if (batchOperations > 0) {
            await batch.commit();
            console.log(`Processed ${endingSubscriptions.docs.length} ending subscriptions and ${expiredSubscriptions.docs.length} expired subscriptions`);
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error checking subscription renewals:', error);
        throw error;
    }
});
//# sourceMappingURL=subscriptions.js.map