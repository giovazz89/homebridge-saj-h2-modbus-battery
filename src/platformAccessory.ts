import { Service, PlatformAccessory } from 'homebridge';
import * as ModbusRTUImport from 'modbus-serial';
import { SajH2ModbusBatteryPlatform } from './platform.js';

// Trick to prevent constructor error in ESM
const ModbusRTU = (ModbusRTUImport.default || ModbusRTUImport) as any;

export class SajBatteryAccessory {
  private service: Service;
  private client = new ModbusRTU();

  // internal state data
  private state = {
    soc: 0,
    chargingState: 0, // 0 = Not Charging, 1 = Charging
    statusLowBattery: 0,
  };

  // fake sensor to carry values
  private humidityService: Service;

  constructor(
    private readonly platform: SajH2ModbusBatteryPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // device info
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SAJ')
      .setCharacteristic(this.platform.Characteristic.Model, 'H2-6K-S');

    // create Battery Service
    this.service = this.accessory.getService(this.platform.Service.Battery) ||
                   this.accessory.addService(this.platform.Service.Battery);

    // workaround service (cannot have standalone battery)
    this.humidityService = this.accessory.getService(this.platform.Service.HumiditySensor) ||
                         this.accessory.addService(this.platform.Service.HumiditySensor);
    this.humidityService.setCharacteristic(this.platform.Characteristic.Name, 'SAJ SOC');

    // start update loop
    this.updateData();
    setInterval(() => this.updateData(), (this.platform.config.interval || 30) * 1000);
  }

  async updateData() {
    try {
      if (!this.client.isOpen) {
        await this.client.connectTCP(this.platform.config.ip, { port: this.platform.config.port });
        this.client.setID(this.platform.config.slaveId);
      }

      // read the 4 registers (base 40960 + offset 12)
      const startRegister = 40960 + 12;
      const response = await this.client.readHoldingRegisters(startRegister, 4);

      const rawSOC = response.data[0];
      const soc = rawSOC * 0.01;

      // read battery current (offset 15, so index 3 in 4 registers buffer)
      // use readInt16BE to manage sign correctly
      const current = response.buffer.readInt16BE(6) * 0.01;

      // inverted logic (empirically confirmed):
      // negative = charging, positive = discharging
      const isCharging = current < -0.1;

      this.state.soc = soc;
      this.state.chargingState = isCharging ? 1 : 0;
      this.state.statusLowBattery = soc < 15 ? 1 : 0;

      // update HomeKit
      this.service.updateCharacteristic(this.platform.Characteristic.BatteryLevel, this.state.soc);
      this.service.updateCharacteristic(this.platform.Characteristic.ChargingState, this.state.chargingState);
      this.service.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.state.statusLowBattery);

      // show percentage tile
      this.humidityService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, soc);

      this.platform.log.debug(`Updated: SOC ${soc}%, Charging: ${isCharging}`);

    } catch (e) {
      this.platform.log.error('Error during Modbus reading:', e);
      this.client.close(() => {});
    }
  }
}
