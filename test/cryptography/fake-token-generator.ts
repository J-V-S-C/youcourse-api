import { TokenGenerator } from 'src/domain/youcourse/application/cryptography/token-generator';

export class FakeTokenGenerator implements TokenGenerator {
  async generate(): Promise<string> {
    return 'fake-reset-token-' + Date.now();
  }
}
