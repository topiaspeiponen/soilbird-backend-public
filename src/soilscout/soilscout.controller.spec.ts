import { Test, TestingModule } from '@nestjs/testing';
import { SoilscoutController } from './soilscout.controller';
import { SoilscoutService } from './soilscout.service';

describe('SoilscoutController', () => {
  let controller: SoilscoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoilscoutController],
      providers: [SoilscoutService],
    }).compile();

    controller = module.get<SoilscoutController>(SoilscoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
