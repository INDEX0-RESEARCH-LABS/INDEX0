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

// -----------------------------------------------------------------------------
// Lago Billable Metrics, Pricing Plans & Webhooks
// -----------------------------------------------------------------------------

export type LagoAggregationType =
  | "sum_agg"
  | "count_agg"
  | "max_agg"
  | "weighted_sum_agg";

export interface ILagoBillableMetric {
  code: string;
  name: string;
  description?: string;
  aggregationType: LagoAggregationType;
  fieldName?: string;
  recurring?: boolean;
}

export type LagoChargeModel = "standard" | "graduated" | "package" | "percentage";

export interface ILagoPlanCharge {
  billableMetricCode: string;
  chargeModel: LagoChargeModel;
  amountCents: number;
  properties?: Record<string, unknown>;
}

export type LagoPlanInterval = "weekly" | "monthly" | "yearly";

export interface ILagoPlan {
  code: string;
  name: string;
  description?: string;
  interval: LagoPlanInterval;
  amountCents: number;
  amountCurrency: string;
  trialPeriod?: number;
  charges: ILagoPlanCharge[];
}

export interface ILagoSubscriptionPayload {
  externalCustomerId: string;
  planCode: string;
  externalId: string;
  billingTime?: "calendar" | "anniversary";
  subscriptionAt?: string;
}

export type LagoWebhookType =
  | "customer.created"
  | "customer.updated"
  | "subscription.created"
  | "subscription.terminated"
  | "invoice.created"
  | "invoice.paid"
  | "invoice.payment_failed";

export interface ILagoWebhookEvent {
  webhookType: LagoWebhookType | string;
  objectType: "customer" | "subscription" | "invoice";
  customer?: ICustomer;
  subscription?: ISubscription;
  invoice?: IInvoice;
  timestamp: string;
}

// -----------------------------------------------------------------------------
// Platform Pillars Manifest (BUILD, SHIP, SELL, GROW)
// -----------------------------------------------------------------------------

export type PlatformPillarName = "BUILD" | "SHIP" | "SELL" | "GROW";

export interface IPlatformPillarService {
  name: string;
  pillar: PlatformPillarName;
  containerName: string;
  port: number;
  healthEndpoint?: string;
  description: string;
}

export interface IPlatformPillarsManifest {
  version: string;
  pillars: Record<PlatformPillarName, IPlatformPillarService[]>;
}

