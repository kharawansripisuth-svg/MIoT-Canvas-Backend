import os
import random
import time
import json
from dotenv import load_dotenv
from datetime import datetime
import paho.mqtt.client as mqtt

load_dotenv()

MQTT_BROKER = os.getenv("BROKER")
MQTT_PORT = int(os.getenv("PORT"))

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    
    # tag_value = random.randint(8, 12)
    MQTT_TOPIC = "sensor/nu/102"
#     MQTT_TOPIC = f"sensor/nu/{tag_value:03d}"
    payload = {
        "meraki": "nu_miraki102",
        "outtempmeas":   round(random.uniform(0, 50), 2),
        "outhumidmeas":  round(random.uniform(0, 100), 2),
        "outco2meas":    round(random.uniform(0, 1000), 2),
        "outtvocmeas":   round(random.uniform(0, 3000), 2),
        "outpm25meas":   round(random.uniform(0, 200), 2)
        }
    
    # ส่งไป MQTT
    message = json.dumps(payload)
    client.publish(MQTT_TOPIC, message)
    print(f"Published: {message}")
    time.sleep(5)