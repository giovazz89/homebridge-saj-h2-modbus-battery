import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { SajBatteryAccessory } from './platformAccessory.js';

export class SajH2ModbusBatteryPlatform implements DynamicPlatformPlugin {
  public readonly Service!: typeof Service;
  public readonly Characteristic!: typeof Characteristic;

  // Loaded accessoryes list (Homebridge cache management)
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.log.debug('SAJ Battery Platform initialization...');

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  // Required for DynamicPlatformPlugin: reloads saved accessories
  configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  discoverDevices() {
    // Generate unique ID based on IP to prevent conflicts
    const uuid = this.api.hap.uuid.generate(`saj-battery-${this.config.ip}`);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Ripristino accessorio esistente dalla cache:', existingAccessory.displayName);
      new SajBatteryAccessory(this, existingAccessory);
    } else {
      this.log.info('Aggiunta nuovo accessorio SAJ Battery:', this.config.name || 'SAJ Battery');

      const accessory = new this.api.platformAccessory(this.config.name || 'SAJ Battery', uuid);
      
      // create Accessory instance
      new SajBatteryAccessory(this, accessory);

      // Register accessory in Homebridge
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}