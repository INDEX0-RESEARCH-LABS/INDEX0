import json, os

task_id = os.environ.get("DEMO_TASK_ID", "demo-divide-zero")
prompt = os.environ.get(
    "DEMO_PROMPT",
    "src/math.js exports divide(numerator, denominator), which returns Infinity when "
    "the denominator is 0. Make divide throw a RangeError with the message "
    "'division by zero' when the denominator is 0. Keep average() working exactly as it is.",
)
files = os.environ.get("DEMO_CONTEXT_FILES", "src/math.js,test/math.test.js")
root = os.environ["DEMO_ROOT"]

print(json.dumps({
    "taskId": task_id,
    "userPrompt": prompt,
    "repositoryRoot": root,
    "contextFiles": [f.strip() for f in files.split(",") if f.strip()],
    "maxIterations": 5,
}, indent=2))
