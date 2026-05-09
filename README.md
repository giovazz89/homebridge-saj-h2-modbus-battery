# Homebridge SAJ H2 Battery

[![Homebridge 2.0 compatible](https://img.shields.io/badge/Homebridge-2.0%20Ready-orange)](https://homebridge.io)

This plugin integrates **SAJ H2-6K-S Inverter** battery data into Apple HomeKit via [Homebridge](https://homebridge.io). It provides real-time monitoring of State of Charge (SOC), charging status, and low battery alerts.

## Features

- **Battery Level**: Displays the current SOC (State of Charge) percentage.
- **Charging State**: Real-time status showing if the battery is Charging or Discharging.
- **Low Battery Alert**: Customizable warning when the battery drops below 15%.
- **Polling Interval**: Adjustable refresh rate to stay updated without overloading the inverter.

## Prerequisites

1. **SAJ H2 Inverter** connected to your local network.
2. **Modbus TCP** enabled on the inverter (usually enabled by default on port 502).
3. **Static IP**: It is highly recommended to assign a static IP address to your inverter.

## Installation

1. Install Homebridge using the [official instructions](https://homebridge.io/how-to-install-homebridge).
2. Search for `homebridge-saj-h2-modbus-battery` in the Homebridge UI "Plugins" tab.
3. Click **Install**.

## Configuration

You can configure this plugin using the Homebridge UI or by adding the following to your `config.json`:

```json
{
  "platform": "SajH2ModbusBatteryPlatform",
  "name": "SAJ Battery",
  "ip": "your IP",
  "port": 502,
  "slaveId": 1,
  "interval": 60
}
```

| Key      | Default            | Description                          |   |   |
|----------|--------------------|--------------------------------------|---|---|
| platform | SajH2ModbusBatteryPlatform | Must be "SajH2ModbusBatteryPlatform".        |   |   |
| ip       | 192.168.x.x        | The IP address of your SAJ inverter. |   |   |
| port     | 502                | Modbus TCP port (usually 502).       |   |   |
| slaveId  | 1                  | Modbus Slave ID (default is 1).      |   |   |
| interval | 60                 | Refresh interval in seconds.         |   |   |

## Disclaimer

This is a third-party plugin and is not officially affiliated with SAJ Electric. Use it at your own risk.

## Thanks

A big thanks to [stanus74](https://github.com/stanus74) and his [home-assistant-saj-h2-modbus](https://github.com/stanus74/home-assistant-saj-h2-modbus), that made easier indentifying the correct registers on the inverter to fetch data from
