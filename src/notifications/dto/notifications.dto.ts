export class NotificationsDto {
    readonly id: number;
    readonly type: string;
    readonly severity: string;
    readonly device: string;
    readonly device_serial_number: number;
    readonly detected_value: string;
    readonly optimal_value: number;
    readonly trigger: string;
    readonly sports_property_id: number;
    readonly turf_id: number;
    readonly timestamp: string;
    readonly read: string;
}
