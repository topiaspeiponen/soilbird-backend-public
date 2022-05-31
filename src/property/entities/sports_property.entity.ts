
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class SportsProperties {
    @PrimaryColumn()
    primary_id: number;

    @Column()
    id: number;

    @Column()
    name: string;

    @Column()
    path_name: string;

    @Column()
    coordinates: string;

    @Column()
    zip: string;

    @Column()
    water_gauges: string;
}
