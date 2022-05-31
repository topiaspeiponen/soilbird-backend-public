import { PartialType } from '@nestjs/mapped-types';
import { CreateSoilscoutDto } from './create-soilscout.dto';

export class UpdateSoilscoutDto extends PartialType(CreateSoilscoutDto) {}
