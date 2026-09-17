# GROW Architecture — INDEX0 AI

The **GROW** subsystem operates around the platform to power product telemetry, developer marketing, social broadcast automation, and audience retention.

---

## 1. Growth Topology

```text
                                  INDEX0 AI
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
               ▼                      ▼                      ▼
        ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
        │   POSTHOG   │        │   POSTIZ    │        │  LISTMONK   │
        │ (Analytics) │        │  (Social)   │        │ (Newsletter)│
        └─────────────┘        └─────────────┘        └─────────────┘
```

---

## 2. Components

### 2.1 PostHog (Product Telemetry & Feature Experimentation)
- **Product Analytics**: Tracks user sessions, feature discovery, and IDE retention funnels.
- **Agent Performance Cohorts**: Analyzes agent completion rates and time-to-PR across organizations.
- **Feature Flags**: Enables canary rollouts of new agent models, MCP tools, and IDE extensions without redeploying services.
- **Session Replays**: Self-hosted replay capabilities for developer debugging and error triage.

### 2.2 Postiz (Social Outreach & Developer Advocacy)
- **Omnichannel Dispatch**: Programmatically schedules and broadcasts product updates across GitHub Discussions, X/Twitter, LinkedIn, and Discord.
- **Changelog Automation**: Extracts verified PR merge notes and compiles release highlights for distribution.

### 2.3 Listmonk (Developer Communications & Deliverability)
- **Transactional Emails**: Welcome series, invitation notifications, invoice alerts, and quota warnings.
- **Developer Digest**: Self-hosted, privacy-respecting weekly digest of platform improvements, model benchmark updates, and open-source contributions.
