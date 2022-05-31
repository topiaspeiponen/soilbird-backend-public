import {
  SoilscoutGroup,
  SoilscoutDevice,
} from './../soilscout/dto/soilscout.dto';
import { PropertyService } from './../property/property.service';
import { SoilscoutService } from './../soilscout/soilscout.service';
import {
  NotificationInternalLogic,
  Notifications,
  NotificationsLogic,
} from './entities/notification.entity';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

enum NotificationImportance {
  OK,
  WARNING,
  DANGER,
  ERROR
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepository: Repository<Notifications>,
    @InjectRepository(NotificationsLogic)
    private readonly notificationsLogicRepository: Repository<NotificationsLogic>,
    private readonly soilscoutService: SoilscoutService,
    private readonly propertyService: PropertyService,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);
  private readonly xd = '';

  private handleNotificationForming(
    device: SoilscoutDevice,
    logic: NotificationsLogic,
    turf_id: number
  ) : Notifications {
    let newNotification : Notifications = {
      id: 0,
      type: "threshold",
      severity: "OK",
      device: 'sensor',
      device_serial_number: device.serial_number,
      detected_value: null,
      optimal_value: null,
      trigger: null,
      sports_property_id: device.site,
      turf_id: turf_id,
      timestamp: Date.now().toString(),
      read: "[]",
    }

    console.log('Notification forming device status ', device.device_status, turf_id)
    if (device.device_status !== 'OK') {
      newNotification.type = 'status';
      newNotification.severity = 'ERROR';
      return newNotification;
    } else {
    const internalLogic : NotificationInternalLogic[] = JSON.parse(JSON.stringify(logic.logic))
    const currentMoisture = device.last_measurement.moisture
    const currentTemperature = device.last_measurement.temperature
    const currentSalinity = device.last_measurement.salinity

    console.log('Current notification forming ', currentMoisture, currentTemperature, currentSalinity)

    let currentImportance : number = 0
    let currentSeverity : string = ""
    let currentTrigger : string = ""
    for (const i in internalLogic) {
      let valueToCheck: number;
      const logicKeyName = internalLogic[i];
      let currentCycleImportance : number = 0

      // ! Skip salinity checking as it is currently unreliable as of 23.07.2021
      // ! Skip temperature checking as it is not needed as of 6.9.2021
      if (logicKeyName.name === 'salinity' || logicKeyName.name === 'temperature') {
        continue;
      }

      switch (logicKeyName.name) {
        case 'moisture':
          valueToCheck = currentMoisture * 100;
          break;
        case 'temperature':
          valueToCheck = currentTemperature;
          break;
        case 'salinity':
          valueToCheck = currentSalinity * 100;
          break;
        default: {
          valueToCheck = currentMoisture;
          break;
        }
      }

      console.log('VALUE TO CHECK ', logicKeyName , valueToCheck)
      // Over max => danger
      if (valueToCheck >= logicKeyName.abs_max) {
        console.log('Value passed DANGER')
        currentSeverity = "DANGER"
        currentTrigger = "HIGH"
        currentCycleImportance = NotificationImportance.DANGER
      }
      // Over warning and below max => warning
      else if (
        valueToCheck < logicKeyName.abs_max &&
        valueToCheck >= logicKeyName.warning_max
      ) {
        console.log('Value passed WARNING')
        currentSeverity = "WARNING"
        currentTrigger = "HIGH"
        currentCycleImportance = NotificationImportance.WARNING
      }
      // Normal range => OK
      else if (
        valueToCheck < logicKeyName.warning_max &&
        valueToCheck >= logicKeyName.normal
      ) {
        console.log('Value passed OK')
        currentSeverity = "OK"
        currentTrigger = null
        currentCycleImportance = NotificationImportance.OK
      }
      // Normal range => OK
      else if (
        valueToCheck < logicKeyName.normal &&
        valueToCheck >= logicKeyName.warning_min
      ) {
        console.log('Value passed OK')
        currentSeverity = "OK"
        currentTrigger = null
        currentCycleImportance = NotificationImportance.OK
      }
      // Below warning and over min => warning
      else if (
        valueToCheck < logicKeyName.warning_min &&
        valueToCheck >= logicKeyName.abs_min
      ) {
        console.log('Value passed WARNING')
        currentSeverity = "WARNING"
        currentTrigger = "LOW"
        currentCycleImportance = NotificationImportance.DANGER
      }
      // Below min => danger
      else if (
        valueToCheck < logicKeyName.abs_min &&
        valueToCheck > logicKeyName.broken
      ) {
        console.log('Value passed DANGER')
        currentSeverity = "DANGER"
        currentTrigger = "LOW"
        currentCycleImportance = NotificationImportance.DANGER
      }
      // Below broken => error
      else if (valueToCheck <= logicKeyName.broken) {
        console.log('Value passed ERROR')
        currentSeverity = "ERROR"
        currentTrigger = "LOW"
        currentCycleImportance = NotificationImportance.ERROR
      } else {
        console.log('Value passed ERROR')
        currentSeverity = "ERROR"
        currentTrigger = "LOW"
        currentCycleImportance = NotificationImportance.ERROR
      }

      // If the status to be used has been set, check the importance of the current status and compare to incoming status
      // Higher importance will take precedent
      if (currentCycleImportance > currentImportance) {
        const detected_value_json_object = {
          [logicKeyName.name]: valueToCheck
        }
        newNotification.detected_value = JSON.stringify(detected_value_json_object)
        newNotification.optimal_value = logicKeyName.normal
        newNotification.severity = currentSeverity
        newNotification.trigger = currentTrigger
        currentImportance = currentCycleImportance;
      }
    }
    console.log('Notification formed ', newNotification.severity)
    return newNotification
  }
  }

  /**
   * Periodically checks latest device measurements and creates/deletes notifications based on them
   * Work order is the following:
   * 1. Fetch all sports property IDs
   * 2. Login to Soilscout service
   * 2. Fetch all device groups for each sports property (id)
   * 3. Fetch all devices for each group
   * 4. Check last measurements for all devices
   * 5. Create notification if necessary, otherwise check for existing notifications for that device and delete it if it exists
   */
  @Cron('45 * * * * *')
  async handleCron() {
    try {
    // Fetch all sports properties IDs that currently exist in our database
    const propertiesIds: number[] = await this.propertyService
      .getAllSportsProperties()
      .then((properties) => {
        let idArray = new Array<number>();
        for (const index in properties) {
          idArray.push(properties[index].id);
        }
        return idArray;
      });


    const allDeviceGroups: Array<SoilscoutGroup[]> = await Promise.all(
      propertiesIds.map(async (id) => {
        return await this.soilscoutService.getSiteGroups(
          id,
        );
      }),
    );

    const turfRegexp = /nurmi\s[1-9]\skaikki/i;
    const filteredDeviceGroups: Array<SoilscoutGroup[]> = await Promise.all(
      allDeviceGroups.map(async (groupsInProperty) => {
        let matchedGroups = new Array<SoilscoutGroup>();
        console.log('grosp in props ', groupsInProperty.length);
        for (const index in groupsInProperty) {
          if (turfRegexp.exec(groupsInProperty[index].name)) {
            matchedGroups.push(groupsInProperty[index]);
          }
        }
        return matchedGroups;
      }),
    );

    // Fetch notification logic
    const notificationLogic: NotificationsLogic[] = await this.notificationsLogicRepository.find();

    // Loop through each group's devices and check each other measurement and determine whether a notification will be made
    await Promise.all(
      filteredDeviceGroups.map(async (groupsInProperty) => {
        for (const index in groupsInProperty) {
          const devicesForGroup: SoilscoutDevice[] = await this.soilscoutService.getSiteDevicesByID(
            groupsInProperty[index].site,
            groupsInProperty[index].devices
          );

          // Find all logic for specific site (may contain multiple)
          const allLogicOnSite = notificationLogic.filter(
            (logic) =>
              logic.sports_property_id === groupsInProperty[index].site,
          );

          let matchedLogic: NotificationsLogic;
          const turf = await this.propertyService.getOneTurfInPropertyBySensorGrp(
            groupsInProperty[index].site,
            groupsInProperty[index].name
          );
          console.log('TURF FOUND ', turf)
          matchedLogic = allLogicOnSite.find(async (logic) => {
            // If turf was found with group's name and turf id matches with logic's turf_id, return said logic
            if (
              turf.length !== 0 &&
              logic.turf_id !== null &&
              logic.turf_id === turf[0].id
            ) {
              return logic;
            }
          });

          // If no matching logic for turf was found, find default logic which has turf_id of null
          if (!matchedLogic) {
            matchedLogic = allLogicOnSite.find(async (logic) => {
              if (logic.turf_id === null) {
                return logic;
              }
            });
          }

          Promise.all(devicesForGroup.map(async(device) => {
            console.log('PRIMISEALL SDFSDFSDFSDFSDF ', turf[0])
            const formedNotification = this.handleNotificationForming(device, matchedLogic, turf[0].id)

            const notificationForDevice = await this.notificationRepository.find({
              where: {
                device_serial_number: device.serial_number
              }
            })
            if (formedNotification.severity === 'OK') {
              if (notificationForDevice.length !== 0) {
               await this.deleteNotification(formedNotification.device_serial_number)
              }
            }
            else {
              if (notificationForDevice.length !== 0) {
                await this.updateGeneratedNotification(formedNotification)
               } else {
                const res = await this.saveNotification(formedNotification)
               }
            }

          }))

        }
      }),
    );

    this.logger.debug('Device groups fetched ');

    //const not = await this.soilscoutService.login()
    this.logger.debug('Called when the current second is 45 ');
  }catch(err) {
    console.log('error ', err)
  }
  }

  async getAllNotifications() {
    try {
      return await this.notificationRepository.find();
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not get all notifications',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async getAllNotificationsForSportsProperty(id: number) {
    try {
      return await this.notificationRepository.find({
        where: {
          sports_property_id: id,
        },
      });
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not get all notifications',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async getAllNotificationsForSportsPropertyFilteredByUserID(
    userId: string,
    sportsPropertyId: number,
  ) {
    try {
      console.log(
        'GetAllnotsForSportsPropsFilteredByUserId ',
        userId,
        sportsPropertyId,
      );
      const results = await this.notificationRepository.find({
        where: {
          sports_property_id: sportsPropertyId,
        },
      });
      console.log(' results ', results);
      let filteredResults = [];
      if (results.length !== 0) {
        for (const resultIndex in results) {
          console.log(
            'resultindex ',
            resultIndex,
            JSON.parse(results[resultIndex].read),
          );
          const parsedRead: number[] = JSON.parse(results[resultIndex].read);
          console.log(
            'prased read ',
            parsedRead,
            userId,
            parsedRead.includes(2),
            typeof userId,
            typeof parsedRead[0],
          );
          if (!parsedRead.includes(parseInt(userId))) {
            filteredResults.push(results[resultIndex]);
          }
        }
      }
      console.log('filtered reesults ', filteredResults);
      return filteredResults;
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not get all notifications',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      console.log('mark notif', notificationId);
      const results = await this.notificationRepository
        .find({
          where: {
            id: notificationId,
          },
        })
        .then(async (notifs) => {
          console.log('notifs length ', notifs.length);
          if (notifs.length !== 0) {
            const fetchedNotif = notifs[0];
            const usersRead: number[] = JSON.parse(fetchedNotif.read);
            usersRead.push(userId);
            fetchedNotif.read = JSON.stringify(usersRead);
            console.log('fetchednotif', fetchedNotif);
            return await this.notificationRepository.save(fetchedNotif);
          }
        });
      return results;
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not mark notification as read',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async getNotificationsLogic(turf_id: number, sportsPropertyId: number) {
    try {
      return await this.notificationsLogicRepository
        .find({
          where: {
            turf_id: turf_id,
            sports_property_id: sportsPropertyId,
          },
        })
        .then(async (logic) => {
          // If logic for turf cannot be found, use general logic, which has ID number 1
          if (logic.length === 0) {
            return await this.notificationsLogicRepository.find({
              where: {
                id: 1,
              },
            });
          } else {
            return logic;
          }
        });
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not get notification logic',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async getAllNotificationsLogic() {
    try {
      return await this.notificationsLogicRepository.find()
    } catch(err) {
      return Promise.reject(
        new HttpException(
          'Could not get notification logic',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async updateNotificationsLogic(logic: NotificationsLogic) {
    try {
      const insertableLogic = logic
      insertableLogic.logic = JSON.stringify(insertableLogic.logic)
      console.log('insertable logic ', insertableLogic)
      return await this.notificationsLogicRepository.update(
        {id: insertableLogic.id}, insertableLogic)

    } catch(err) {
      console.log('error updating logic ', err)
      return Promise.reject(
        new HttpException(
          'Could not get update notification logic',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async createNotificationsLogic(logic : NotificationsLogic) {
    try {
      const insertableLogic = logic
      insertableLogic.logic = JSON.stringify(insertableLogic.logic)
      return await this.notificationsLogicRepository.insert(insertableLogic)
    } catch(err) {
      console.log('error creating logic ', err)
      return Promise.reject(
        new HttpException(
          'Could not create notification logic',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async deleteNotificationsLogic(turfId: number, propertyId: number) {
    try {
      if (turfId === null && propertyId === null) {
        throw new HttpException(
          'Need turf ID and property ID to delete logic',
          HttpStatus.BAD_REQUEST,
        )
      }

      return await this.notificationsLogicRepository.delete({
        turf_id: turfId,
        sports_property_id: propertyId
      })
    } catch(err) {
      console.log('error deleting logic ', err)
      return Promise.reject(
        new HttpException(
          'Could not get delete notification logic',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async saveNotification(notification : Notifications) {
    try {
      const response = await this.notificationRepository.save(notification);
      return response
    } catch (err) {
      console.log('Couldnt save notif ', err)
      return Promise.reject(
        new HttpException(
          'Could not save notification',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async updateGeneratedNotification(genNotif: Notifications) {
    try {
      const response = await this.notificationRepository.update(
        {device_serial_number: genNotif.device_serial_number}, 
        {
          severity: genNotif.severity, 
          detected_value: genNotif.detected_value,
          optimal_value: genNotif.optimal_value,
          trigger: genNotif.trigger,
          timestamp: genNotif.timestamp
      })
      return response;
    } catch(err) {
      console.log('Couldnt update gen notif ', err)
      return Promise.reject(
        new HttpException(
          'Could not update generated notification',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }

  async deleteNotification(serial: number) {
    try {
      const response = await this.notificationRepository.delete({device_serial_number: serial})
      return response
    } catch (err) {
      return Promise.reject(
        new HttpException(
          'Could not delete notification',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
  }
}
