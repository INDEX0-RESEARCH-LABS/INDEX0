# INDEX0 Live Demo Script

## Two-minute demo outline

---

### Opening (0:00 to 0:15): What you are looking at

> "INDEX0 is a self-hosted software engineering platform with a terminal CLI, sandboxed execution, and context compression. It provides an interactive terminal interface, git-native agent coordination, token filtering, and prompt routing to hosted or self-hosted models. Let me show you the live CLI."

---

### Step 1: Main Demo (0:15 to 1:00): Prompt Routing Against a Hosted Model

Build the CLI from source first:

```bash
pnpm install
pnpm --dir packages/client-harness build
```

Configure your model endpoint (pointing to any OpenAI-compatible provider, Azure OpenAI, or local LiteLLM gateway):

```bash
export INDEX0_API_BASE="https://api.openai.com/v1" # or your LiteLLM / Azure gateway URL
export INDEX0_API_KEY="your-api-key"
export INDEX0_MODEL="gpt-4o"
```

Execute a prompt directly through the CLI:

```bash
node packages/client-harness/dist/cli.js prompt "Summarize the GNAP protocol in two sentences"
```

**What to point at in the output:**

1. The latency spinner showing real-time routing to the configured model.
2. The sanitized terminal output with response payload.
3. The monochrome status bar showing model identification, turn duration, and token accounting.

---

### Step 2: Secondary Demo (1:00 to 1:30): Local Microbenchmarks and Integrity Firewall

Run the empirical microbenchmark command to verify local subsystems:

```bash
node packages/client-harness/dist/cli.js benchmark
```

**What to point at in the output:**

1. Context compression transform ratios: explicitly labeled as local string transform estimates across repository files, not end-to-end task completion numbers.
2. Terminal token filter: shows ANSI stripping and progress-bar deduplication.
3. Git-Native Agent Protocol (GNAP): shows state initialization and signed disk messages inside `.gnap/`.
4. Claim Firewall: verifies that unverified marketing claims are quarantined and blocked from publication.

---

### Closing (1:30 to 2:00): What is proven, what is next, what I need

> "What is proven today: the CLI builds and runs locally, model routing works against hosted endpoints, context compression is measured at the string-transform level, and git-native coordination writes to `.gnap/`. What is next: executing official, reproducible SWE-bench evaluation runs under controlled conditions. What I need: pilot design partners to deploy this on real internal repositories and feedback on workflow integration."

---

## Fallback if the live demo fails (30 seconds)

1. Open the recorded walkthrough video at `[VIDEO DEMO LINK HERE]`.
2. Narrate over the video: "This recording shows the CLI prompt routing and benchmark suite running on a local development environment. Numbers shown are local transform ratios and smoke checks, not published benchmark results."
3. Close with: "I will provide the link to the recording and reproducible steps immediately after this call."
