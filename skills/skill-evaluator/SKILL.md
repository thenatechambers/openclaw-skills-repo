---
name: skill-evaluator
description: A deterministic evaluation framework for OpenClaw skills. Run structured tests against your skills with expected inputs/outputs, measure success rates, and catch regressions before deployment. Perfect for teams building production-grade agent workflows.
---

# Skill Evaluator

Run deterministic tests against your OpenClaw skills. Catch bugs before they hit production.

## What It Does

This skill provides a lightweight evaluation framework for testing OpenClaw skills:

- **Define test cases** as YAML with inputs and expected outputs
- **Run deterministic evaluations** — same input always produces same check
- **Measure pass/fail rates** across your skill suite
- **Catch regressions** when skill updates break existing behavior
- **Generate reports** showing which tests pass and why failures occur

## Why This Matters

Agentic AI is powerful but unpredictable. When you deploy a skill that:
- Parses user calendar requests
- Extracts data from emails
- Routes support tickets
- Makes API calls with structured parameters

...you need confidence it works reliably. This evaluator treats your skills like software — with tests that prove correctness.

## Installation

1. Copy this skill to your OpenClaw workspace:
   ```bash
   cp -r skills/skill-evaluator ~/openclaw/skills/
   ```

2. Create a `tests/` directory in the skill you want to evaluate

3. Add test cases (see format below)

## Test Case Format

Create YAML files in `tests/`:

```yaml
# tests/calendar-parse.yaml
name: "Calendar parsing - basic event"
input:
  user_message: "Schedule a meeting with Sarah tomorrow at 2pm"
expected:
  contains:
    - "Sarah"
    - "meeting"
  json_schema:
    type: object
    properties:
      attendee:
        type: string
      datetime:
        type: string
---
name: "Calendar parsing - multi-attendee"
input:
  user_message: "Book a call with Sarah, Mike, and Jenny for Friday 3pm"
expected:
  contains:
    - "Sarah"
    - "Mike"
    - "Jenny"
  not_contains:
    - "error"
    - "unable"
```

## Running Evals

### Command Line

```bash
# Run all tests for a skill
./skills/skill-evaluator/scripts/run-eval.sh skills/my-skill

# Run specific test file
./skills/skill-evaluator/scripts/run-eval.sh skills/my-skill tests/calendar-parse.yaml

# Run with verbose output
./skills/skill-evaluator/scripts/run-eval.sh skills/my-skill --verbose
```

### From Your Skill

```yaml
# In your SKILL.md
---
# Run evals before completing task
pre_check: skill-evaluator
---
```

## Match Types

### `contains` / `not_contains`
Check if output includes (or excludes) specific strings:

```yaml
expected:
  contains:
    - "confirmed"
    - "booking"
  not_contains:
    - "error"
    - "failed"
```

### `json_schema`
Validate output matches JSON schema:

```yaml
expected:
  json_schema:
    type: object
    required: ["status", "id"]
    properties:
      status:
        enum: ["success", "pending"]
```

### `regex`
Match output against regex patterns:

```yaml
expected:
  regex:
    - "\\d{4}-\\d{2}-\\d{2}"  # Date format
    - "booking_[a-z0-9]+"         # Booking ID format
```

### `exact`
Exact string match (use sparingly — agents vary output):

```yaml
expected:
  exact: "Booking confirmed: BK-12345"
```

## Example: Testing an Email Parser Skill

```yaml
# skills/email-parser/tests/extract-meeting-request.yaml
name: "Extract meeting request from email"
input:
  user_message: |
    From: client@example.com
    Subject: Need to reschedule our call
    
    Hi, can we move our Wednesday 2pm to Thursday 10am?
    
    Thanks,
    Sarah
expected:
  contains:
    - "reschedule"
    - "Wednesday"
    - "Thursday"
  json_schema:
    type: object
    properties:
      original_time:
        type: string
      requested_time:
        type: string
      client_name:
        type: string
```

## Eval Report Output

```
═══════════════════════════════════════════
SKILL EVALUATION REPORT
═══════════════════════════════════════════

Skill: email-parser
Tests Run: 12
Passed: 10
Failed: 2
Success Rate: 83.3%

───────────────────────────────────────────
FAILED TESTS
───────────────────────────────────────────

❌ Extract meeting request from email
   Reason: Missing field 'client_name' in output
   
❌ Handle empty subject line
   Reason: Output contains 'error' (not_contains violation)

───────────────────────────────────────────
RECOMMENDATION
───────────────────────────────────────────

Fix 2 failing tests before deploying.
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/skill-tests.yml
name: Skill Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Skill Evals
        run: |
          ./skills/skill-evaluator/scripts/run-eval.sh skills/*
```

## Best Practices

1. **Test edge cases**: Empty inputs, malformed data, ambiguous requests
2. **Use `contains` not `exact`**: Agent wording varies; test for concepts
3. **Assert on structure**: Use `json_schema` for API responses
4. **Test failure modes**: Ensure errors are handled gracefully
5. **Keep tests fast**: Evals should complete in seconds, not minutes

## When NOT to Use This

- Creative writing skills (output is inherently variable)
- Brainstorming/ideation skills (no "correct" answer)
- Skills that should adapt to context (defeats the purpose)

Use this for **deterministic, structured tasks** where correctness matters.

## Integration with Cortex

When deploying via Cortex, add to your `agent.yaml`:

```yaml
skills:
  - name: email-parser
    tests:
      - tests/*.yaml
    
pre_deploy:
  - skill-evaluator --fail-on-error
```

This blocks deployment if tests fail.

---

**Built for production agents. Test before you deploy.**
