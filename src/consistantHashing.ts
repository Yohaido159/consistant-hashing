import { createHash } from 'crypto';

// @ts-ignore
Map.prototype.toJSON = function () {
  return JSON.parse(JSON.stringify(Object.fromEntries(this)));
};

abstract class IConsistantHashing {
  abstract hashFunction(key: string): number;
  abstract addServer(server: string): void;
  abstract removeServer(server: string): void;
  abstract getServer(key: string): string | null;
  abstract getServers(): string[];
}

export class Logger {
  public active: boolean;
  constructor() {
    this.active = false;
  }

  setLoggerActive() {
    this.active = true;
  }

  setLoggerInactive() {
    this.active = false;
  }

  log(...message: any[]) {
    if (this.active) {
      console.log(message);
    }
  }
}

export class ConsistantHashing implements IConsistantHashing {
  public logger: Logger;
  public servers: string[] = [];
  public ring: Map<number, string> = new Map();

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
    this.placeServersEqually();
  }

  hashFunction(key: string) {
    this.logger.log(`hashFunction: Called with key: ${key}`);
    const hash = createHash('md5').update(key).digest('hex');
    const hashNumber = parseInt(hash, 16);

    return hashNumber % 360;
  }

  private placeServersEqually(): void {
    this.logger.log(`placeServersEqually: Called`);
    const step = 360 / this.servers.length;
    this.ring = new Map();
    this.servers.forEach((server, index) => {
      const angle = Math.floor(index * step);
      this.ring.set(angle, server);
    });
    this.logger.log(`placeServersEqually finished`);
    //@ts-ignore
    this.logger.log(`ring: ${JSON.stringify(this.ring)}`);
  }

  addServer(server: string) {
    this.logger.log(`addServer: Called with server: ${server}`);
    this.servers.push(server);
    const beforeRing = new Map(this.ring);
    this.placeServersEqually();
    this.findAffectedHashSlots(beforeRing);
    this.logger.log(`addServer finished`);
  }

  removeServer(server: string) {
    this.logger.log(`removeServer: Called with server: ${server}`);
    const index = this.servers.indexOf(server);
    if (index !== -1) {
      this.servers.splice(index, 1);
      const beforeRing = new Map(this.ring);
      this.placeServersEqually();
      this.findAffectedHashSlots(beforeRing);
    }
    this.logger.log(`index: ${index}`);
    this.logger.log(`removeServer: ${server}`);
    this.logger.log(`servers: ${this.servers}`);
    this.logger.log(`removeServer finished`);
  }

  public getServer(key: string): string | null {
    this.logger.log(`getServer: Called with key: ${key}`);
    if (this.servers.length === 0) {
      return null;
    }

    const hash = this.hashFunction(key);
    let angle = hash % 360;

    this.logger.log(`hash: ${hash}`);
    this.logger.log(`angle: ${angle}`);

    for (let i = 0; i < 360; i++) {
      if (this.ring.has(angle)) {
        this.logger.log(`ring return: ${this.ring.get(angle)}`);
        this.logger.log(`getServer finished insde if`);
        return this.ring.get(angle) as string;
      }
      angle = (angle + 1) % 360;
      this.logger.log(`ring not returned angle: ${angle}`);
      this.logger.log(`getServer finished`);
    }
    return null;
  }

  getServers() {
    this.logger.log(`getServers: Called`);
    return this.servers;
  }

  public findAffectedHashSlots(ring: Map<number, string>) {
    this.logger.log(`findAffectedHashSlots: Called`);
    const afterRing = new Map(this.ring);

    const affectedHashSlots: number[] = [];
    for (const [angle, server] of ring) {
      if (afterRing.get(angle) !== server) {
        affectedHashSlots.push(angle);
      }
    }

    this.logger.log(`affectedHashSlots: ${affectedHashSlots}`);

    return affectedHashSlots;
  }
}
