import { createHash } from 'crypto';

abstract class IConsistantHashing {
  abstract hashFunction(key: string): number;
  abstract addServer(server: string): void;
  abstract removeServer(server: string): void;
  abstract getServer(key: string): string | null;
  abstract getServers(): string[];
}

export class ConsistantHashing implements IConsistantHashing {
  public servers: string[];

  constructor() {
    this.servers = [];
  }

  hashFunction: IConsistantHashing['hashFunction'] = (key) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  };

  addServer(server: string) {
    this.servers.push(server);
    this.servers.sort();
  }

  removeServer(server: string) {
    const index = this.servers.indexOf(server);
    if (index !== -1) {
      this.servers.splice(index, 1);
    }
  }

  getServer(key: string) {
    if (this.servers.length === 0) {
      return null;
    }

    const hash = this.hashFunction(key);
    for (let i = 0; i < this.servers.length; i++) {
      const serverHash = this.hashFunction(this.servers[i]);
      if (serverHash >= hash) {
        return this.servers[i];
      }
    }
    return this.servers[0];
  }

  getServers() {
    return this.servers;
  }
}
