---
description: Reference for the Miniviz data ingestion API, including the POST endpoint, payload rules, supported value types, and examples.
---

# Miniviz API Reference

Miniviz API supports the following endpoints.

* [Data Transmission API](api_reference)
* [Image Transmission API](api_image_reference)

## API Endpoint (Data Transmission)

```text
POST https://api.miniviz.net/api/project/{project_id}?token={token}
```

## Request Overview
Data transmission to Miniviz API uses the `POST` method. The request body is in JSON format.

## Request Body

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `timestamp`  | number | Yes | Transmission time (UNIX time in milliseconds) e.g., `1731129600000` |
| `label_key`  | string | Yes | Label to identify the source, such as device name or location e.g., `raspberry_pi`, `esp32`, `local_pc` |
| `payload`    | object | Yes | Actual measurement values to send. Specify any metric name as the key, and a number or string as the value |

## Acceptable Payload Data Types
The payload accepts the following data types.

### String Type (str)
- No constraints (no character limit)
- Example: `"ON"`, `"OFF"`, `"OPEN"`, `"CLOSE"`

### Numeric Types
- **Integer Type (int)**: No constraints (no range limit)
- **Floating Point Type (float)**: No constraints (no range limit)
- Example: `42`, `-10`, `3.14`, `-99.9`

### Unacceptable Types

The following types cannot be used as `payload` values:

- **Dictionary (dict)**: Nested objects are not allowed
- **Array (list, tuple, set)**: Array types are not allowed
- **Boolean (bool)**: Not allowed (use string `"true"`/`"false"` or numeric `1`/`0`)
- **null/None**: Not allowed

### Payload Constraints

- **Number of Keys**: Maximum 8
- **Size**: Maximum 400 bytes after JSON encoding
- **Structure**: Flat (no nesting allowed)

## Request Example

```json
{
  "timestamp": 1731129600000, // Only UNIX time in milliseconds is accepted
  "label_key": "raspberry_pi_home",
  "payload": {
    "temperature": 25,
    "humidity": 55,
    "switch": "true", // Specify True or False as a string.
    "system_status": "running" // Specify any string.
  }
}
```


## curl Command (Linux/MacOS)

```bash

timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/{project_id}?token={token}" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"Local_PC\",
        \"payload\": {
          \"temperature\": 25,
          \"humidity\": 55,
          \"switch\": \"true\",
          \"system_status\": \"running\"
        }
      }"
```

