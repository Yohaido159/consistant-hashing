//@ts-nocheck
import { ConsistantHashing, Logger } from '../src/consistantHashing';

describe('Consistant Hashing', () => {
  let ch: ConsistantHashing;
  let logger: Logger;
  beforeEach(() => {
    logger = new Logger();
    ch = new ConsistantHashing({
      logger,
    });
  });

  it('should add server', () => {
    ch.addServer('server1');
    expect(ch.servers).toEqual(['server1']);
  });

  it('should remove server', () => {
    ch.addServer('server1');
    ch.removeServer('server1');
    expect(ch.servers).toEqual([]);
  });

  it('should get server', () => {
    // logger.setLoggerActive();
    ch.addServer('server1');
    ch.addServer('server2');
    ch.addServer('server3');

    expect(ch.getServer('user:1')).toEqual('server1');
  });

  it('should place servers equally', () => {
    // logger.setLoggerActive();

    ch.addServer('server1');
    expect(ch.ring.toJSON()).toEqual({ '0': 'server1' });

    ch.addServer('server2');
    expect(ch.ring.toJSON()).toEqual({ '0': 'server1', '180': 'server2' });

    ch.addServer('server3');
    expect(ch.ring.toJSON()).toEqual({
      '0': 'server1',
      '120': 'server2',
      '240': 'server3',
    });

    ch.addServer('server4');
    expect(ch.ring.toJSON()).toEqual({
      '0': 'server1',
      '90': 'server2',
      '180': 'server3',
      '270': 'server4',
    });

    ch.addServer('server5');
    expect(ch.ring.toJSON()).toEqual({
      '0': 'server1',
      '72': 'server2',
      '144': 'server3',
      '216': 'server4',
      '288': 'server5',
    });

    expect(ch.servers).toEqual(['server1', 'server2', 'server3', 'server4', 'server5']);
  });

  it('assign keys to servers', () => {
    // logger.setLoggerActive();

    ch.addServer('server1');
    ch.addServer('server2');
    ch.addServer('server3');
    ch.addServer('server4');

    const serversRing = {
      '0': 'server1',
      '90': 'server2',
      '180': 'server3',
      '270': 'server4',
    };

    expect(ch.ring.toJSON()).toEqual(serversRing);

    const hashUser1 = 272;
    const hashUser2 = 72;
    const hashUser3 = 352;
    const hashUser4 = 96;

    expect(ch.hashFunction('user:1')).toEqual(hashUser1);
    expect(ch.hashFunction('user:2')).toEqual(hashUser2);
    expect(ch.hashFunction('user:3')).toEqual(hashUser3);
    expect(ch.hashFunction('user:4')).toEqual(hashUser4);

    expect(ch.getServer('user:1')).toEqual(serversRing[0]);
    expect(ch.getServer('user:2')).toEqual(serversRing[90]);
    expect(ch.getServer('user:3')).toEqual(serversRing[0]);
    expect(ch.getServer('user:4')).toEqual(serversRing[180]);
  });
});
