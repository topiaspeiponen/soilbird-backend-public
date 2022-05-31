import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Sector {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    turf_id: number;

    @Column()
    name: string;

    @Column('json')
    coordinates: string;

    @Column('json')
    sensors: string;

    @Column()
    sprinklers: string;
}
