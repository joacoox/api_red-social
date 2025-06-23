import { TestingModule, Test } from '@nestjs/testing';
import { JwtService } from '../../servicices/jwt/jwt.service';


describe('AuthorizedGuard', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
