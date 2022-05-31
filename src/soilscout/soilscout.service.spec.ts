import { Test, TestingModule } from '@nestjs/testing';
import { SoilscoutService } from './soilscout.service';

describe('SoilscoutService', () => {
  let service: SoilscoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoilscoutService],
    }).compile();

    service = module.get<SoilscoutService>(SoilscoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
