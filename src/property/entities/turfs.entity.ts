import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Turfs {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    sports_properties_id: string;

    @Column()
    sensors_group: string;

    @Column()
    path_name: string;

    @Column()
    sprinklers: string;

    @Column()
    coordinates: string

    @Column()
    water_gauges: string
}
