import { HttpService, Injectable, HttpException, HttpStatus } from '@nestjs/common';

const API_KEY = process.env.WATER_API_KEY
const baseURL = process.env.WATER_BASEURL

@Injectable()
export class WaterService {
    constructor(private httpService: HttpService) {}

    async getWaterConsumptionForProperty(startDate: string, endDate: string, zipCode: string) {
        try {
            console.log('Getting water consumption ', startDate, endDate, zipCode, API_KEY)
            const res =  await this.httpService.get(baseURL, {
                params: {
                    'query[start]': startDate,
                    'query[end]': endDate,
                    'filter[zipCode]': zipCode
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_KEY
                },
            }).toPromise();
            console.log('Data water consum ', res.data)
            return res.data;
        } catch(err) {
            console.log('Error getting water consumption for property')
            return Promise.reject(new HttpException('Error getting water consumption for property', HttpStatus.BAD_REQUEST))
        }
    }
}
