import { Argon2idPasswordHasher } from '../../../../../src/adapter/out/auth/argon2id-password-hasher';

describe('Argon2idPasswordHasher', () => {
  const hasher = new Argon2idPasswordHasher();

  describe('hash', () => {
    it('produces an argon2id encoded hash, not the plaintext', async () => {
      const digest = await hasher.hash('correct horse battery staple');

      expect(digest).not.toContain('correct horse battery staple');
      expect(digest.startsWith('$argon2id$')).toBe(true);
    });

    it('encodes the configured cost parameters', async () => {
      const digest = await hasher.hash('s3cret');

      // argon2 embeds the parameters in the encoded hash.
      expect(digest).toContain('m=19456,t=2,p=1');
    });

    it('uses a random salt so equal inputs yield different hashes', async () => {
      const [a, b] = await Promise.all([
        hasher.hash('same-input'),
        hasher.hash('same-input'),
      ]);

      expect(a).not.toBe(b);
    });
  });

  describe('verify', () => {
    it('accepts the password that produced the hash', async () => {
      const digest = await hasher.hash('s3cret');

      await expect(hasher.verify('s3cret', digest)).resolves.toBe(true);
    });

    it('rejects a password that does not match the hash', async () => {
      const digest = await hasher.hash('s3cret');

      await expect(hasher.verify('wrong', digest)).resolves.toBe(false);
    });
  });
});
