---
layout: default
title: ESP32 Sample (Data Sending Test)
# parent: Sample Code
nav_order: 1
---

# ESP32 Sample 1 (Simple Data Sending Example)

This sample code demonstrates how to send data to Miniviz API using ESP32.
The sending interval is set to 90 seconds (deep sleep mode).

```cpp
#include <Arduino.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

//----------------------------------------
// Configuration
//----------------------------------------
const int PIN_DHT = 4;
DHT dht(PIN_DHT, DHT11);

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";

// Miniviz API
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

String endpoint = String("https://api.miniviz.net/api/project/") +
                  project_id + "?token=" + token;

// Deep Sleep (90 seconds)
const uint64_t SLEEP_INTERVAL_US = 90ULL * 1000000ULL;


//----------------------------------------
// Wi-Fi Connection
//----------------------------------------
void connectWiFi()
{
  Serial.println("Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(300);
    Serial.print(".");
    retry++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected");
  } else {
    Serial.println("Wi-Fi connection failed");
  }
}

//----------------------------------------
// NTP Time Synchronization
//----------------------------------------
void syncTime()
{
  Serial.println("Syncing NTP...");
  configTime(0, 0, "ntp.nict.jp", "time.google.com");

  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
    Serial.print("*");
  }
  Serial.println("\nTime synced");
}

//----------------------------------------
// UNIX Timestamp in Milliseconds
//----------------------------------------
uint64_t getTimestampMs()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint64_t)tv.tv_sec * 1000ULL + (tv.tv_usec / 1000ULL);
}

//----------------------------------------
// POST to Miniviz
//----------------------------------------
void sendToMiniviz(float temp, float humid)
{
  if (WiFi.status() != WL_CONNECTED)
    connectWiFi();

  HTTPClient http;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  uint64_t ts = getTimestampMs();

  String body = "{";
  body += "\"timestamp\":" + String(ts) + ",";
  body += "\"label_key\":\"esp32_home\",";
  body += "\"payload\":{";
  body += "\"temperature\":" + String(temp) + ",";
  body += "\"humidity\":" + String(humid);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

//----------------------------------------
// Setup
//----------------------------------------
void setup()
{
  Serial.begin(115200);
  delay(200);

  dht.begin();
  connectWiFi();
  syncTime();
}

//----------------------------------------
// Loop (exits after one iteration due to DeepSleep)
//----------------------------------------
void loop()
{
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  Serial.printf("Temperature: %.2f°C  Humidity: %.2f%%\n", t, h);

  sendToMiniviz(t, h);

  Serial.println("Entering deep sleep...");
  esp_deep_sleep(SLEEP_INTERVAL_US);
}
```

