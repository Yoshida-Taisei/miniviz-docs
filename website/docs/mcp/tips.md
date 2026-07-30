---
description: Practical Miniviz MCP question patterns for understanding project data safely and efficiently.
---

# Miniviz MCP Tips

Miniviz MCP works best when your question identifies a project, a time range, and the metric or condition you care about. Start broad, then narrow the question with the result.

## Start With Context

If the project is not clear, ask:

```text
Which Miniviz projects can I use in this chat?
```

Then identify the project by name in later questions.

## Check the Latest State

Use this for a quick current-status check:

```text
For <project>, show the latest temperature and humidity readings.
```

Name the fields you need. When field names are unknown, ask:

```text
For <project>, what event fields and label values are available?
```

## Ask for a Bounded Trend

Make the period and aggregation explicit:

```text
For <project>, summarize temperature over the last 24 hours in one-hour averages.
```

For longer periods, ask for coarser buckets:

```text
For <project>, show the monthly temperature trend for the last year.
```

## Count Conditions Before Inspecting Events

For threshold questions, ask for the count first:

```text
For <project>, how many events had temperature at or above 30 during the last 30 days? Show the daily top five.
```

Then inspect a narrow period if you need individual records:

```text
Show the matching temperature and status events on the busiest day.
```

This sequence is clearer than asking for a large raw-event dump.

## Compare Labels Deliberately

When a project has multiple devices or locations, name the label values you want to compare:

```text
Compare the last 24 hours of temperature for label values <label-a> and <label-b> in <project>.
```

## Ask for Explanation, Not Just Values

Miniviz MCP can also help you interpret configured monitoring:

```text
For <project>, explain the configured charts and monitoring rules in plain language.
```

It returns safe summaries and does not reveal notification destinations or credentials.

## Know When to Use the App Instead

Use the Miniviz Database page when you need a dense table view, manual CSV work, or broad row-by-row inspection. MCP is intentionally bounded for conversational analysis and does not provide unlimited raw-event export.

Miniviz MCP also does not calculate exact continuous durations, detect every missing-data interval, or write data and settings. For these cases, narrow the question, inspect the data in the app, or use your own downstream analysis workflow.
