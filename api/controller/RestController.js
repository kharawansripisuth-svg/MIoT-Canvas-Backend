class DeviceController {
    constructor(deviceService) {
        this.deviceService = deviceService;
    }

    async registerDevice(req, res) {
        try {
            const { deviceId, name, location, model } = req.body;
            const credentials = await this.deviceService.registerDevice(deviceId, name, location, model);
            res.json({ success: true, credentials });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async sendData(req, res) {
        try {
            const { deviceId, apiKey, payload } = req.body;
            const savedData = await this.deviceService.storeData(deviceId, apiKey, payload);
            res.json({ success: true, result: savedData });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    getData = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const data = await this.deviceService.getAllData(limit);
            res.json({ success: true, data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

module.exports = new DeviceController();