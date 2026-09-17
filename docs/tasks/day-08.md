# DAY 8 TASK: Billing Engine (Lago + Stripe)

## ROLE
Vibecoder A

## OBJECTIVE
Implement the Billing integration service, synchronizing metered usage to Lago, managing subscription states, and processing authenticated Stripe webhooks.

## CONTRACT
- `@index0/contracts/v1/billing`
- `@index0/contracts/v1/api`

## ALLOWED FILES
- `services/billing/**`

## DEPENDENCIES
- Node.js / TypeScript
- Stripe SDK (`stripe`)
- Lago API SDK
- Express

## REQUIREMENTS
1. Architecture pipeline implementation:
   ```text
   OpenMeter → Lago → Stripe
   ```
2. Customer and subscription synchronization:
   - Create and map organization records to Lago customer objects.
   - Sync plan subscriptions and track tier quotas.
3. Stripe Webhook handling (`POST /billing/webhooks/stripe`):
   - Cryptographically verify Stripe signature with `STRIPE_WEBHOOK_SECRET`.
   - Handle events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Update database models (`Customer`, `Subscription`, `Invoice`) via `@index0/db`.
5. Expose `GET /health` endpoint.

## FORBIDDEN CHANGES
- Never accept Stripe webhooks without cryptographic signature validation.
- Do not hardcode billing pricing tiers; derive them from Lago contract models.

## TESTS
- Stripe webhook signature verification tests with mock payloads.
- Lago customer sync unit test.

## DEFINITION OF DONE
- [ ] `services/billing` compiles and passes `pnpm --filter @index0/billing test`.
- [ ] Stripe webhook handler correctly verifies signatures and handles payloads.
- [ ] Database synchronization models update cleanly without contract violations.
