---
description: Move a device that sends data to Ambient (ambidata.io) to MiniViz, with before/after sample code for Python, ESP32, and curl.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Migrate from Ambient to MiniViz

This guide is for devices that already send data to Ambient (ambidata.io).
It shows the minimum code changes needed to send the same sensor values to MiniViz.

## What changes

<div className="migration-table">

| Item | Ambient | MiniViz |
|------|---------|---------|
| Endpoint | <pre><code>{`POST https://ambidata.io/api/v2/channels/{channelId}/data`}</code></pre> | <pre><code>{`POST https://api.miniviz.net/api/project/{project_id}`}</code></pre> |
| Credentials | `writeKey` in the request body | <ul><li><code>Authorization: Bearer &#123;token&#125;</code> header</li><li><code>?token=&#123;token&#125;</code> query</li></ul> |
| Grouping | One channel per device | One project, `label_key` identifies the device (e.g. `"label_key": "living-room"`) |
| Values | `d1` to `d8` (8 fixed slots) | Any keys in `payload` (up to 8 keys, 400 bytes) |
| Time | `created` (optional, string or ms) | `timestamp` (required, UNIX time in milliseconds) |
| Bulk send | `/dataarray` accepts many records | Not available, one record per request |
| Request body | <pre><code>{`{\n  "writeKey": "WRITE_KEY",\n  "d1": 25.0,\n  "d2": 55.0\n}`}</code></pre> | <pre><code>{`{\n  "timestamp": 1731129600000,\n  "label_key": "living-room",\n  "payload": {\n    "temperature": 25.0,\n    "humidity": 55.0\n  }\n}`}</code></pre> |
| Shortest interval | 5 seconds per channel (up to 3,000 records/day, about 28.8 seconds on average) | 60 seconds (free) / 15 seconds (Pro) per project |

</div>

- Most of the change is in the request body.
- `writeKey` moves into the `Authorization` header.
- `timestamp` and `label_key` are added.
- `d1` and `d2` become named keys such as `temperature` and `humidity`.
- Numbers can stay numbers, or be strings such as `"25.0"`, which is what the Ambient Arduino library sends.

### References

- [Ambient specifications (limits)](https://ambidata.io/refs/spec/)
- [Ambient Python library](https://ambidata.io/refs/python/) / [Arduino library](https://ambidata.io/refs/arduino/)
- [MiniViz API Reference](../api_endpoint/api_reference)

## Steps

1. Create a MiniViz project and copy the project ID and token. See [Quick Start](../quickstart).
2. Decide the `payload` keys, for example `temperature` and `humidity`.
3. Replace the send function with the MiniViz version. Samples are at the end of this page.
4. Send one record and confirm it on the Database page.

## Notes

:::caution Send interval and past data

- The send interval depends on the plan: 60 seconds (free) and 15 seconds (Pro). If you were sending every 5 seconds on Ambient, adjust to this interval.
- The interval is per project, not per device. When several devices share one project, either combine their readings in one payload or take turns. See [Quick Start](../quickstart) for examples.
- Sends that are too fast return `429` with a `Retry-After` header.
- There is no `/dataarray` equivalent, so migrating past data is not realistic (one day of 5-minute data takes about 72 minutes even on Pro). Export the history to CSV instead.

:::

:::info Naming the keys

- `payload` keys are free-form. Renaming the `d1`/`d2` slots to names such as `temperature` and `humidity` makes charts easier to read. The same metric under two names becomes two fields, so apply the rename to new data only.
- `label_key` allows `A-Z`, `a-z`, `0-9`, `-`, `_`, `.`, `:`, `@`, `/` up to 128 characters. A Japanese channel name cannot be used, so use an ASCII name such as `ambient-ch12345`.

:::

## Sample Code

### Python

Both sides are plain HTTP POST, so the change is only the URL, headers and body. No extra library is needed.
MiniViz does not require a dedicated library here: any HTTP client works.
If you use the official `ambient` library, the "before" call is `am.send({"d1": temperature, "d2": humidity})`.

<Tabs>
  <TabItem value="python" label="Python" default>

**Before (Ambient)**

```python
import time
import requests

response = requests.post(
    f"https://ambidata.io/api/v2/channels/{CHANNEL_ID}/data",
    json={"writeKey": WRITE_KEY, "d1": temperature, "d2": humidity},
    timeout=10,
)
```

**After (MiniViz, token in the URL)**

```python
import time
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
LABEL_KEY = "ambient-ch12345"  # ASCII only, up to 128 characters


def send_to_miniviz(temperature, humidity):
    response = requests.post(
        f"https://api.miniviz.net/api/project/{PROJECT_ID}?token={TOKEN}",
        json={
            "timestamp": int(time.time() * 1000),
            "label_key": LABEL_KEY,
            "payload": {
                "temperature": temperature,
                "humidity": humidity,
            },
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    while True:
        temperature, humidity = 25.0, 55.0  # replace with your sensor read
        send_to_miniviz(temperature, humidity)
        time.sleep(60)  # Ambient allowed 5 seconds, the free plan requires 60
```

**After (MiniViz, Authorization header)**

```python
import time
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
LABEL_KEY = "ambient-ch12345"  # ASCII only, up to 128 characters


def send_to_miniviz(temperature, humidity):
    response = requests.post(
        f"https://api.miniviz.net/api/project/{PROJECT_ID}",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={
            "timestamp": int(time.time() * 1000),
            "label_key": LABEL_KEY,
            "payload": {
                "temperature": temperature,
                "humidity": humidity,
            },
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    while True:
        temperature, humidity = 25.0, 55.0  # replace with your sensor read
        send_to_miniviz(temperature, humidity)
        time.sleep(60)  # Ambient allowed 5 seconds, the free plan requires 60
```

Use either the header or the query token. If you send both, the values must match.

  </TabItem>
  <TabItem value="cpp" label="C++ (Arduino)">

**Before (Ambient)**

```cpp
#include <Ambient.h>

Ambient ambient;

ambient.begin(CHANNEL_ID, WRITE_KEY, &client);
ambient.set(1, temperature);
ambient.set(2, humidity);
ambient.send();
```

**After (MiniViz, token in the URL)**

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

void sendToMiniviz(float temperature, float humidity)
{
  HTTPClient http;
  http.begin(String("https://api.miniviz.net/api/project/") + project_id +
             "?token=" + token);
  http.addHeader("Content-Type", "application/json");

  struct timeval tv;
  gettimeofday(&tv, NULL);
  uint64_t ts = (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;

  String body = "{\"timestamp\":" + String(ts) +
                ",\"label_key\":\"ambient-ch12345\",\"payload\":{";
  body += "\"temperature\":" + String(temperature, 1) + ",";
  body += "\"humidity\":" + String(humidity, 1);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }

  // MiniViz needs a timestamp, so sync the clock first
  configTime(0, 0, "ntp.nict.jp", "time.google.com");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
  }

  float temperature = 25.0;  // replace with your sensor read
  float humidity = 55.0;
  sendToMiniviz(temperature, humidity);

  // Ambient's 5 seconds is not allowed: sleep at least 60 seconds on the free plan
  esp_sleep_enable_timer_wakeup(60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
```

**After (MiniViz, Authorization header)**

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

void sendToMiniviz(float temperature, float humidity)
{
  HTTPClient http;
  http.begin(String("https://api.miniviz.net/api/project/") + project_id);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + token);

  struct timeval tv;
  gettimeofday(&tv, NULL);
  uint64_t ts = (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;

  String body = "{\"timestamp\":" + String(ts) +
                ",\"label_key\":\"ambient-ch12345\",\"payload\":{";
  body += "\"temperature\":" + String(temperature, 1) + ",";
  body += "\"humidity\":" + String(humidity, 1);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }

  // MiniViz needs a timestamp, so sync the clock first
  configTime(0, 0, "ntp.nict.jp", "time.google.com");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
  }

  float temperature = 25.0;  // replace with your sensor read
  float humidity = 55.0;
  sendToMiniviz(temperature, humidity);

  // Ambient's 5 seconds is not allowed: sleep at least 60 seconds on the free plan
  esp_sleep_enable_timer_wakeup(60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
```

  </TabItem>
  <TabItem value="curl" label="curl">

**Before (Ambient)**

```bash
curl -X POST "https://ambidata.io/api/v2/channels/$CHANNEL_ID/data" \
  -H "Content-Type: application/json" \
  -d "{\"writeKey\":\"$WRITE_KEY\",\"d1\":25.0,\"d2\":55.0}"
```

**After (MiniViz, token in the URL)**

```bash
timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/$PROJECT_ID?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"ambient-ch12345\",
        \"payload\": {
          \"temperature\": 25.0,
          \"humidity\": 55.0
        }
      }"
```

**After (MiniViz, Authorization header)**

```bash
timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"ambient-ch12345\",
        \"payload\": {
          \"temperature\": 25.0,
          \"humidity\": 55.0
        }
      }"
```

  </TabItem>
</Tabs>

For the full request and payload rules, see the [API Reference](../api_endpoint/api_reference).
