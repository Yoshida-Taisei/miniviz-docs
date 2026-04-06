
# Visualize Temperature & Humidity with Raspberry Pi Pico W × DHT11 — Build an IoT Prototype with Miniviz

This guide walks through reading temperature and humidity with a Raspberry Pi Pico W and DHT11, sending the data to `Miniviz`, and visualizing it.  
It is a good fit for IoT prototypes and beginner electronics projects.

## Table of Contents

- [What Is Miniviz?](#what-is-miniviz)
- [What We'll Do](#what-well-do)
- [Required Items](#required-items)
- [Wire the Pico and DHT11](#wire-the-pico-and-dht11)
- [Acquire Data](#acquire-data)
- [Send to Miniviz](#send-to-miniviz)
- [Verify on Miniviz](#verify-on-miniviz)
- [Create graphs](#create-graphs)
- [Summary](#summary)
- [Beta program](#beta-program)
- [Tags](#tags)

## What Is Miniviz?

A service for easily storing, visualizing, and notifying on IoT data and images.  
It suits prototypes (PoC), hobby electronics, and education.

[Miniviz - IoT Data Visualization & Graphing Platform](https://miniviz.net)

## What We'll Do

Use a Raspberry Pi Pico W and a `DHT11` temperature/humidity sensor to read values and visualize them on `Miniviz`.

## Required Items

- Raspberry Pi Pico W (referred to below as “Pico”)
- DHT11 (temperature & humidity sensor)
- Breadboard and jumper wires
- MicroPython environment
- Miniviz project ID and token

## Wire the Pico and DHT11

Wire the circuit as shown in the photo.

![Wiring photo](/images/pico/pico_1_01.png)

### Pin assignment

| Pico pin | Connection | Role |
| --- | --- | --- |
| `36` | `VCC` | Power |
| `20` (`GP15`) | `DATA` | Signal |
| `38` | `GND` | Ground |

![Wire colors (yellow VCC, blue GND, green GP15)](/images/pico/pico_1_02.png)

## Acquire Data

### Set Up VS Code / MicroPython

This guide uses the MicroPython extension for VS Code.

- Install the `MicroPico` extension  
  It helps manage communication with the Pico and transferring code in one place.
- Run `MicroPico: Configure project` from the Command Palette (`Ctrl+Shift+P`)  
  This creates Pico-specific completion and connection settings in the folder.

![Extension screen](/images/pico/pico_1_03.png)

![Bottom toolbar / action menu](/images/pico/pico_1_04.png)

### Install Pico Firmware

1. Download the `UF2` file for your board (Pico or Pico W) from the official site.
2. Hold the `BOOTSEL` button while connecting USB.
3. When the Pico appears as a removable drive, copy the `UF2` file onto it.
4. After it reboots automatically, you are ready.

[MicroPython on Raspberry Pi Pico](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html#drag-and-drop-micropython)

### Data acquisition script

Once the environment is set up, run the sample script below.  
The onboard LED blinks when data is read successfully.

```python
from machine import Pin
import dht
import time

led = Pin("LED", Pin.OUT)

# DHT11 connected to GPIO 15
sensor = dht.DHT11(Pin(15))

print("Starting measurements...")

while True:
    try:
        # Trigger measurement
        sensor.measure()

        # Get values
        temperature = sensor.temperature()
        humidity = sensor.humidity()

        print(f"Temperature: {temperature}°C, Humidity: {humidity}%")

        # Blink onboard LED on success
        led.on()
        time.sleep(0.1)
        led.off()

    except OSError as e:
        print("Failed to read sensor. Check wiring!")

    # Wait for 2 seconds (DHT11 requirement)
    time.sleep(2)
```

When you run it, temperature and humidity values are printed.

![Output after Run](/images/pico/pico_1_05.png)

## Send to Miniviz

### Get project ID and token

Extend the previous code with Wi-Fi, time sync, and HTTP requests to send data to `Miniviz`.

Create a project and obtain the project ID and token.  
See the quick start for details.

![Project ID and token screen](/images/pico/pico_1_06.png)

### Source code to send to Miniviz

Replace Wi-Fi credentials, project ID, and token with your own values.

```python
import network
import urequests
import time
import machine
import dht
import ntptime

# ================= Configuration =================
WIFI_SSID  = "YOUR_WIFI_SSID"       # Wi-Fi SSID
WIFI_PASS  = "YOUR_WIFI_PASSWORD"   # Wi-Fi Password
PROJECT_ID = "YOUR_PROJECT_ID"      # Miniviz Project ID
TOKEN      = "YOUR_TOKEN"           # Miniviz API Token
LABEL_KEY  = "PicoW_DHT"            # Label for the device
SEND_INTERVAL = 120                 # Interval between sends (seconds)
# =================================================

# Hardware Setup
dht_sensor = dht.DHT11(machine.Pin(15))
try:
    led = machine.Pin("LED", machine.Pin.OUT)
except ValueError:
    led = machine.Pin(25, machine.Pin.OUT)

def connect_wifi():
    """Connect to Wi-Fi and sync time via NTP"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASS)

    print(f"Connecting to {WIFI_SSID}...", end="")
    while not wlan.isconnected():
        led.toggle()
        time.sleep(0.5)

    print("\n✅ Wi-Fi Connected!")
    led.off()

    # Attempt time synchronization using NTP
    ntptime.host = "ntp.nict.jp"
    try:
        print("Syncing time via NTP...", end="")
        ntptime.settime()
        print(" Done!")
    except:
        print(" Failed (Using internal clock)")

def send_data_to_miniviz(temp, hum):
    """Send measurement data to Miniviz and log details"""
    url = f"https://api.miniviz.net/api/project/{PROJECT_ID}?token={TOKEN}"

    # Calculate UNIX timestamp in milliseconds
    # Assuming time.time() is synced to 1970 Epoch
    unix_time_sec = time.time()
    ts_ms = int(unix_time_sec * 1000)

    # Create Miniviz-compliant payload
    payload = {
        "timestamp": ts_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": temp,
            "humidity": hum
        }
    }

    print("\n" + "=" * 40)
    print("📡 Data Packet Prepared")
    print(f"  [Timestamp] {ts_ms}")
    print(f"  [Label]     {LABEL_KEY}")
    print(f"  [Metrics]   Temp: {temp}°C, Humidity: {hum}%")
    print("-" * 40)

    try:
        print("🚀 Sending request to Miniviz...", end="")
        res = urequests.post(url, json=payload)

        if res.status_code in [200, 201]:
            print(f"\n✅ Success! (Status: {res.status_code})")
            print(f"  Response: {res.text}")
            # Blink LED twice on successful transmission
            for _ in range(2):
                led.on()
                time.sleep(0.1)
                led.off()
                time.sleep(0.1)
        else:
            print(f"\n❌ Server Error (Status: {res.status_code})")
            print(f"  Reason: {res.text}")

        res.close()
    except Exception as e:
        print(f"\n⚠️ Network/Connection Error: {e}")
    print("=" * 40)

def main():
    connect_wifi()

    print("\nStarting Telemetry (Ctrl+C to stop)")

    while True:
        try:
            # Read from sensor
            dht_sensor.measure()
            t = dht_sensor.temperature()
            h = dht_sensor.humidity()

            # Send data
            send_data_to_miniviz(t, h)

        except OSError as e:
            print(f"❌ Sensor Read Error: {e}")

        # Wait for the next interval
        time.sleep(SEND_INTERVAL)

if __name__ == "__main__":
    main()
```

When you run it, transmission logs appear in the console.

![Log on successful send](/images/pico/pico_1_07.png)

## Verify on Miniviz

Open the `Database` menu to inspect the data you sent.  
It may take about 30 seconds to show up.

![Database screen](/images/pico/pico_1_08.png)

## Create graphs

Use the `Viz` menu to build charts.  
This example uses a line chart.

![Chart configuration](/images/pico/pico_1_09.png)

![Created line chart](/images/pico/pico_1_10.png)

## Summary

This guide showed how to visualize temperature and humidity with a Raspberry Pi Pico.  
`Miniviz` also supports many other sensor payloads and images—give them a try.

## Beta program

We are looking for participants to try the Pro plan.  
Individuals, students, and companies who can use the product and share feedback may receive Pro access for a limited time. Contact us or DM for details.

A regular 2-week free trial is also available. The Pro plan supports images as well—worth exploring.

[Miniviz - IoT Data Visualization & Graphing Platform](https://miniviz.net)

## Tags

`#IT` `#indiedev` `#IoT` `#electronics` `#RaspberryPi` `#RaspberryPiPico`
