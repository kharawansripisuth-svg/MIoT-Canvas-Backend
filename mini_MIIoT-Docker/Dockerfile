# ใช้ Node.js version 18
FROM node:18-alpine

# สร้าง directory สำหรับแอป
WORKDIR /usr/src/app

# คัดลอก package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกไฟล์ทั้งหมดเข้าใน Container
COPY . .

# เปิด Port 3000 ตามที่ระบุใน server.js
EXPOSE 3000

# คำสั่งรันแอป
CMD [ "npm", "start" ]