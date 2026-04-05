import { Injectable } from '@nestjs/common';
import { TokenGenerator } from 'src/domain/youcourse/application/cryptography/token-generator';
import { randomUUID } from 'crypto';

@Injectable()
export class UUIDTokenGenerator implements TokenGenerator {
  async generate(): Promise<string> {
    return randomUUID();
  }
}
