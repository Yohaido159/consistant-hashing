import { ConsistantHashing } from '../src/consistantHashing';

describe('Consistant Hashing', () => {
    let ch: ConsistantHashing;
    beforeEach(() => {
        ch = new ConsistantHashing();
    }
    );

    it('should add server', () => {
        ch.addServer('server1');
        expect(ch.servers).toEqual(['server1']);
    }
});

        
