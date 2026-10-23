# INDEX0 Live Demo Script

## Two-minute demo outline

---

### Opening (0:00 to 0:15) — What you are looking at

> "INDEX0 is a self-hosted software engineering platform. Instead of chatting with a model and copy-pasting code, you run one command and the platform creates an isolated worktree, runs your task through a four-stage automated review loop, and hands you back a signed Git commit. Let me show you the entry point."

---

### The single command to run (0:15 to 1:00)

Build the CLI from source first (no hosted install required):

```bash
pnpm install
pnpm --filter @index0/client-harness build
```

Then launch the local microbenchmark to show the platform is live:

```bash
node packages/client-harness/dist/cli.js benchmark
```

**What to point at in the output:**

1. The Viking context compression line that reports the transform ratio (L0/L1/L2 reduction percentages). This is labeled as a local string transform estimate, not an end-to-end result.
2. The GNAP disk consensus line that shows the `.gnap/` directory being written.
3. The terminal token filter line that shows ANSI noise being stripped.

If the LiteLLM gateway is running, also run:

```bash
node packages/client-harness/dist/cli.js prompt "Summarize the GNAP protocol"
```

This shows a real LLM call routed through your local gateway.

---

### Closing (1:30 to 2:00) — What is proven, what is next, what I need

> "What is proven today: the CLI runs, the four-tier review loop code exists and type-checks, context compression works at the string-transform level, and Git-native coordination writes to `.gnap/`. What is next: we are running the first official SWE-bench pilot to produce a number we can actually publish. What I need from you: either a pilot customer who will run this on a real codebase, or compute to run the official evaluation harness."

---

## Fallback if the live demo fails (30 seconds)

1. Open the recorded walkthrough video at `[VIDEO DEMO LINK HERE]`.
2. Narrate over the video: "This recording shows the CLI benchmark running on my development machine. The numbers you see are local transform ratios, not published benchmark results."
3. Close with: "I will send you the link to the recording immediately after this call."
