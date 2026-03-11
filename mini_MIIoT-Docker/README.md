# Docker Setup

## 1. Create .env file
## 2. Bring the backup.sql file to init-db folder
## 3. CMD `docker-compose up --build`
## 4. Test API in Postman
HTTP Method PUT: `http://localhost:3000/api/selectmeasurement`

JSON Body

```json
{
  "device_name": "device_name", // cisco_mt15, ciscomv22, mfec_meter, mfec_energymeter
  "device_number": "device_number" //001,002,...
}
