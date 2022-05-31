import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Notifications {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    type: string;

    @Column()
    severity: string;

    @Column()
    device: string;

    @Column()
    device_serial_number: number;

    @Column({nullable: true})
    detected_value: string;

    @Column({nullable: true})
    optimal_value: number;

    @Column({nullable: true})
    trigger: string;

    @Column()
    sports_property_id: number;

    @Column()
    turf_id: number;

    @Column()
    timestamp: string;

    @Column()
    read: string;
}

@Entity()
export class NotificationsLogic {
    @PrimaryColumn()
    id: number;

    @Column()
    turf_id: number;

    @Column()
    sports_property_id: number;

    @Column()
    logic_type: string;

    @Column()
    device_type: string;

    @Column()
    logic: string;
}

export class NotificationInternalLogic {
    name: string;
    broken: number;
    normal: number;
    abs_max: number;
    abs_min: number;
    warning_max: number;
    warning_min: number;
}
