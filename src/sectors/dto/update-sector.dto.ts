import { PartialType } from '@nestjs/mapped-types';
import { CreateSectorDto } from './create-sector.dto';

export class UpdateSectorDto extends PartialType(CreateSectorDto) {
    turf_id: number;
    name: string;
    coordinates: string;
    sensors: string;
    sprinklers: string;
}
