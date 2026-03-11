import random
import time
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import paho.mqtt.client as mqtt

load_dotenv()

MQTT_BROKER = "mqtt"
MQTT_PORT = 1883
MQTT_TOPIC = "sensor/cu_energymeter"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    tag_value = "cu_energymeter{:03d}".format(random.randint(1, 12))

    payload = {
            "cu_energymeter": tag_value,
            "active_energy_delivered": round(random.uniform(0, 50), 2),
            "current_a": round(random.uniform(0, 50), 2),
            "current_b": round(random.uniform(0, 50), 2),
            "current_c": round(random.uniform(0, 50), 2),
            "current_avg": round(random.uniform(0, 50), 2),
            "voltage_ab": round(random.uniform(0, 50), 2),
            "voltage_bc": round(random.uniform(0, 50), 2),
            "voltage_ca": round(random.uniform(0, 50), 2),
            "voltage_avg": round(random.uniform(0, 50), 2),
            "active_power": round(random.uniform(0, 50), 2),
            "reactive_power": round(random.uniform(0, 50), 2),
            "apparent_power": round(random.uniform(0, 50), 2),
            "power_factor": round(random.uniform(0, 50), 2),
            "frequency": round(random.uniform(0, 50), 2),
            "un_voltage_ab": round(random.uniform(0, 50), 2),
            "un_voltage_bc": round(random.uniform(0, 50), 2),
            "un_voltage_ca": round(random.uniform(0, 50), 2),
            "un_voltage_ll": round(random.uniform(0, 50), 2),
            "present_demand": round(random.uniform(0, 50), 2),
    }

    message = json.dumps(payload)
    client.publish(MQTT_TOPIC, message)
    print(f"[{datetime.now()}] Published: {message}")
    time.sleep(5)