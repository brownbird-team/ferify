import { CryptoService } from '../../services/CryptoService.js';
import { describe, it, expect } from 'vitest';

describe('Testing CryptoService', async () => {
    it('hashEmail', () => {
        const configContextMock1 = {
            config: { hashPepper: 'this_is_papper_1' }
        };
        const cryptoService1 = new CryptoService(configContextMock1);

        const configContextMock2 = {
            config: { hashPepper: 'this_is_papper_2' }
        };
        const cryptoService2 = new CryptoService(configContextMock2);

        const email1 = 'something1@example.com';
        const email2 = 'something2@example.com';

        const hash1 = cryptoService1.hashEmail(email1);
        const hash2 = cryptoService1.hashEmail(email1);
        const hash3 = cryptoService1.hashEmail(email2)

        const hash4 = cryptoService2.hashEmail(email1);
        const hash5 = cryptoService2.hashEmail(email2);

        expect(hash1).to.equal(hash2);
        expect(hash1).to.not.equal(hash3);
        expect(hash1).to.not.equal(hash4);
        expect(hash3).to.not.equal(hash5);
    });

    it('checkEmail', () => {
        const configContext = {
            config: {
                emailRegex: /aa/i,
            }
        };
        const cryptoService = new CryptoService(configContext);

        expect(cryptoService.checkEmail('aa')).to.equal(true);
        expect(cryptoService.checkEmail('bb')).to.equal(false);
    });
});