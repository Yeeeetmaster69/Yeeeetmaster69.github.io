
import { functionUrl } from '../config/env';

export async function upsertCustomer(payload:{ uid?:string; email:string; givenName?:string; familyName?:string; phone?:string }){
  const r = await fetch(functionUrl('sqUpsertCustomer'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function createEstimate(payload: { customerId:string; items:{name:string; quantity:string; amountCents:number}[]; memo?:string; jobId?:string }:{ customerId:string; items:{name:string; quantity:string; amountCents:number}[]; memo?:string }){
  const r = await fetch(functionUrl('sqCreateEstimate'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function createAndSendInvoice(payload: { customerId:string; items:{name:string; quantity:string; amountCents:number}[]; memo?:string; dueDate?:string; jobId?:string }:{ customerId:string; items:{name:string; quantity:string; amountCents:number}[]; memo?:string; dueDate?:string }){
  const r = await fetch(functionUrl('sqCreateAndSendInvoice'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function publishInvoice(payload:{ invoiceId:string; version:number }){
  const r = await fetch(functionUrl('sqPublishInvoice'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function createPaymentLink(payload:{ name:string; amountCents:number; quantity?:number }){
  const r = await fetch(functionUrl('sqCreatePaymentLink'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}
