import crypto from 'crypto';

export default class RestService {
    constructor(deviceModel, dataModel) {
        this.deviceModel = deviceModel;
        this.dataModel = dataModel;
    }

    async registerDevice(deviceId, name, location, model) {
        if (!deviceId || !name) {
            throw new Error('deviceId and name are required');
        }
        const apiKey = crypto.randomBytes(16).toString('hex');
        await this.deviceModel.addDevice(deviceId, name, apiKey, location, model);
        return { deviceId, apiKey };
    }

    async storeData(deviceId, apiKey, payload) {
        const device = await this.deviceModel.findDevice(deviceId, apiKey);
        if (!device) {
            throw new Error('Invalid credentials');
        }
        return await this.dataModel.addData(deviceId, payload);
    }

    async getAllData(limit) {
        return await this.dataModel.getData(limit);
    }
}
module.exports = RestService;