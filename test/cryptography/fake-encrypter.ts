import { Encrypter } from 'src/domain/youcourse/application/cryptography/encrypter';

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }

  async decrypt(token: string): Promise<Record<string, unknown>> {
    return JSON.parse(token);
  }
}

