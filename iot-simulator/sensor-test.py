import random
import time
import json
import os

from dotenv import load_dotenv

from datetime import datetime
import paho.mqtt.client as mqtt

load_dotenv()

MQTT_BROKER = os.getenv("BROKER")
MQTT_PORT = int(os.getenv("PORT"))
MQTT_TOPIC = "sensor/test"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# 3. เริ่ม Loop การทำงาน
while True:

        tag_value = "weather_meter"

        payload = {
            "weather_meter": tag_value,
            "temp": round(random.uniform(0, 50), 2),
            "humid": round(random.uniform(0, 50), 2),
            "pressure": round(random.uniform(0, 50), 2),
            "wind_speed": round(random.uniform(0, 50), 2),
            "rainfall": round(random.uniform(0, 50), 2),
    }

        message = json.dumps(payload)
        client.publish(MQTT_TOPIC, message)
        print(f"[{datetime.now()}] Published: {message}")
        time.sleep(5)