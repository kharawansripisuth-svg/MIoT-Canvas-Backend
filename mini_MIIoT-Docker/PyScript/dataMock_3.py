import random
import time
import json
from datetime import datetime
import paho.mqtt.client as mqtt

MQTT_BROKER = "mqtt"
MQTT_PORT = 1883
MQTT_TOPIC = "sensor/cu_cisco"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    
    device_type = random.choice(["cu_ciscomt15", "cu_ciscomv22", "cu_meter"])
    
    if device_type == "cu_ciscomt15":
        tag_value = random.randint(1, 12)
        if tag_value <= 7:
                payload = {
                "cu_cisco": f"{device_type}{tag_value:03d}",
                "intempmeas":    round(random.uniform(0, 50), 2),
                "inhumidmeas":   round(random.uniform(0, 100), 2),
                "inco2meas":     round(random.uniform(0, 1000), 2),
                "intvocmeas":    round(random.uniform(0, 3000), 2),
                "inpm25meas":    round(random.uniform(0, 200), 2),
                }
        else:
                payload = {
                "cu_cisco": f"{device_type}{tag_value:03d}",
                "outtempmeas":   round(random.uniform(0, 50), 2),
                "outhumidmeas":  round(random.uniform(0, 100), 2),
                "outco2meas":    round(random.uniform(0, 1000), 2),
                "outtvocmeas":   round(random.uniform(0, 3000), 2),
                "outpm25meas":   round(random.uniform(0, 200), 2)
                }
        
    elif device_type == "cu_ciscomv22":
        tag_value = f"{device_type}{random.randint(1, 7):03d}"
        payload = {
            "cu_cisco": tag_value,
            "occcount": round(random.randint(1,100))
        }
        
    elif device_type == "cu_meter":
        tag_value = f"{device_type}{random.randint(1, 1):03d}"
        payload = {
            "cu_cisco": tag_value,
            "totalconsumption": round(random.randint(0, 50)),
            "cabonemission": round(random.randint(0,2000)),
            "totalconsumptionkw": round(random.randint(0,4000)),
        }

    # ส่งไป MQTT
    message = json.dumps(payload)
    client.publish(MQTT_TOPIC, message)
    print(f"Published: {message}")
    time.sleep(5)