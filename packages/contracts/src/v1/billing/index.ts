/**
 * Billing & Metering Contracts — @index0/contracts/v1/billing
 * Authoritative schema definitions for OpenMeter events, Lago subscriptions, and Stripe billing models.
 */

export type SubscriptionTier = "free" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "paused";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "uncollectible"
  | "void";

export interface ICustomer {
  id: string;
  organizationId: string;
  externalCustomerId: string;
  email: string;
  name?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  invoicePdfUrl?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type MeteredDimension =
  | "tokens.total"
  | "tokens.prompt"
  | "tokens.completion"
  | "sandbox.duration_ms"
  | "agent.run_count"
  | "storage.bytes";

export interface IOpenMeterEvent {
  id: string;
  type: MeteredDimension | string;
  subject: string;
  timestamp: string;
  data: {
    value: number;
    [key: string]: unknown;
  };
}

export interface IUsageEvent {
  id: string;
  organizationId: string;
  dimension: MeteredDimension | string;
  quantity: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
