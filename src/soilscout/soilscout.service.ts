import { SoilscoutDevice, SoilscoutDevicePost, SoilscoutGroup, SoilscoutGroupPost } from './dto/soilscout.dto';
import {
  BadRequestException,
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateSoilscoutDto } from './dto/create-soilscout.dto';
import { UpdateSoilscoutDto } from './dto/update-soilscout.dto';
import { map } from 'rxjs/operators';
import { SIGTERM } from 'node:constants';
import { StringDecoder } from 'node:string_decoder';

const baseUrlSoilscout = process.env.SOILCOUT_BASEURL;

let soilscout_access_token = '';
let soilscout_refresh_token = '';

@Injectable()
export class SoilscoutService {
  constructor(private httpService: HttpService) {}

  async login() {
    try {
      const login = await this.httpService
        .post(
          baseUrlSoilscout + 'auth/login/',
          {
            username: process.env.SOILSCOUT_USER,
            password: process.env.SOILSCOUT_PASSWORD,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      console.log('login ', login.data);
      return login.data;
    } catch (e) {
      console.error('Login error ', e.response.status);
      return Promise.reject(
        new HttpException('Login error', e.response.status),
      );
    }
  }

  async refresh(refresh: string) {
    try {
      console.log('refresh token ', refresh);
      const response = await this.httpService
        .post(
          baseUrlSoilscout + 'auth/token/refresh/',
          { refresh: refresh },
          { headers: { 'Content-Type': 'application/json' } },
        )
        .toPromise();
      return response.data;
    } catch (e) {
      console.error('Token refresh error ', e.response.status);
      return Promise.reject(
        new HttpException('Token refresh error', e.response.status),
      );
    }
  }

  async verifyToken(token: string) {
    try {
      console.log('Verify func ', token);
      await this.httpService
        .post(baseUrlSoilscout + 'auth/token/verify/', { token: token })
        .toPromise();
      return true;
    } catch (e) {
      console.error('Token verify error ', e.response.status);
      return false;
    }
  }

  async handleAuth() {
    try {
      let newLogin = false;
      // If tokens haven't been set yet, login and set tokens
      if (soilscout_access_token === '' || soilscout_refresh_token === '') {
        const tokens = await this.login();
        soilscout_access_token = tokens.access;
        soilscout_refresh_token = tokens.refresh;
        newLogin = true;
        return true;
      }

      const access = await this.verifyToken(soilscout_access_token);
      const refresh = await this.verifyToken(soilscout_refresh_token);

      if (!access && refresh) {
        const refreshed_tokens = await this.refresh(soilscout_refresh_token);
        soilscout_access_token = refreshed_tokens.access;
        soilscout_refresh_token = refreshed_tokens.refresh;
      } else if (!access && !refresh) {
        const tokens = await this.login();
        soilscout_access_token = tokens.access;
        soilscout_refresh_token = tokens.refresh;
        newLogin = true;
      }
      return true
    } catch (e) {
      console.log('Error authenticating Soilscout')
      return false
    }
  }

  async getSiteDevices(site: number) {
    try {
      await this.handleAuth()
      console.log('getting site devices');
      const response = await this.httpService
        .get(baseUrlSoilscout + 'devices/?site=' + site, {
          headers: {
            Authorization: 'Bearer ' + soilscout_access_token,
          },
        })
        .toPromise();

      return response.data;
    } catch (e) {
      console.error('Error getting site devices ', e.response.status);
      return Promise.reject(
        new HttpException('Error getting site devices', e.response.status),
      );
    }
  }

  async getSiteDevicesByID(site: number, ids: Array<Number>) {
    try {
      await this.handleAuth()
      console.log('getting site devices by id');
      const response = await this.httpService
        .get(baseUrlSoilscout + 'devices/?site=' + site, {
          headers: {
            Authorization: 'Bearer ' + soilscout_access_token,
          },
        })
        .toPromise()
        .then((response) => {
          const devices: Object = response.data;
          var matchedDevices = [];
          for (var i in devices) {
            //console.log('Device found ', devices[i])
            const device = devices[i];

            if (ids.includes(device.id)) {
              console.log('Device matched');
              matchedDevices.push(device);
            }
          }
          return matchedDevices;
        });

      return response;
    } catch (e) {
      console.error('Error getting site devices by id', e.response.status);
      return Promise.reject(
        new HttpException(
          'Error getting site devices by id',
          e.response.status,
        ),
      );
    }
  }

  async getSiteGroups(site: number) {
    try {
      await this.handleAuth()
      const response = await this.httpService
        .get(baseUrlSoilscout + 'groups/?site=' + site, {
          headers: {
            Authorization: 'Bearer ' + soilscout_access_token,
          },
        })
        .toPromise();

      return response.data;
    } catch (e) {
      console.error('Error getting site groups ', e.response.status);
      return Promise.reject(
        new HttpException('Error getting site groups', e.response.status),
      );
    }
  }

  async createDevice(device: SoilscoutDevicePost) {
    try {
      await this.handleAuth()
      console.log('Tokens ', soilscout_access_token, device)
      const response = await this.httpService
      .post(baseUrlSoilscout + "devices/", 
      device, 
      {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        },
      }
      ).toPromise()

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error creating device', e.response.status),
      );
    }
  }

  async updateDevice(id: number, device: SoilscoutDevicePost) {
    try {
      await this.handleAuth()
      console.log('updating device ', id, device)
      const response = await this.httpService
      .patch(baseUrlSoilscout + "devices/" + id, device, {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        },
      }).toPromise();

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error updating device', e.response.status)
      )
    }
  }

  async deleteDevice(id: number) {
    try {
      await this.handleAuth()
      const response = await this.httpService
      .delete(baseUrlSoilscout + "devices/" + id, {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        }
      }).toPromise();

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error deleting device', e.response.status)
      )
    }
  }

  async createGroup(group: SoilscoutGroupPost) {
    try {
      await this.handleAuth()
      const response = await this.httpService
      .post(baseUrlSoilscout + "groups/", group,  {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        }
      }).toPromise();

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error creating group', e.response.status)
      )
    }
  }

  async updateGroup(id: number, group: SoilscoutGroupPost) {
    try {
      await this.handleAuth()
      const response = await this.httpService
      .patch(baseUrlSoilscout + "groups/" + id, group, {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        }
      }).toPromise();

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error updating group', e.response.status)
      )
    }
  }

  async deleteGroup(id: number) {
    try {
      await this.handleAuth()
      const response = await this.httpService
      .delete(baseUrlSoilscout + "groups/" + id, {
        headers: {
          Authorization: 'Bearer ' + soilscout_access_token,
        }
      }).toPromise();

      return response.data;
    } catch(e) {
      console.log(e)
      return Promise.reject(
        new HttpException('Error deleting group', e.response.status)
      )
    }
  }

  async getDevicesMeasurementsAggr(
    since: Date,
    until: Date,
    devices: string,
    window_size: number,
    aggregate_all: boolean
  ) {
    try {
      await this.handleAuth()
      console.log(
        'GetDevicesMeasurements ',
        since,
        until,
        devices,
        window_size,
        aggregate_all,
        soilscout_access_token,
      );
      const response = await this.httpService
        .get(baseUrlSoilscout + 'measurements/aggregated', {
          params: {
            since: since,
            until: until,
            device: devices,
            window_size: window_size,
            aggregate_all: aggregate_all,
          },
          headers: {
            Authorization: 'Bearer ' + soilscout_access_token,
          },
        })
        .toPromise();

      return response.data;
    } catch (e) {
      console.error(
        'Error getting aggregated measurements ',
        e.response.status,
      );
      return Promise.reject(
        new HttpException(
          'Error getting aggregated measurements',
          e.response.status,
        ),
      );
    }
  }
}
