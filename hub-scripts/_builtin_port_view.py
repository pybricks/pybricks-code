from pybricks.pupdevices import (
    DCMotor,
    Motor,
    ColorSensor,
    UltrasonicSensor,
    ForceSensor,
    ColorDistanceSensor,
    TiltSensor,
    InfraredSensor,
)
from pybricks.parameters import Port
from pybricks.tools import wait, AppData
from pybricks.iodevices import PUPDevice
from usys import version, implementation


# Figure out the available ports for the given hub.
ports = [Port.A, Port.B]
try:
    ports += [Port.C, Port.D]
    ports += [Port.E, Port.F]
except AttributeError:
    pass

try:
    from pybricks.hubs import PrimeHub
    from pybricks.parameters import Icon, Button

    hub = PrimeHub()
    hub.light.off()

    # Create an animation of the heart icon with changing brightness.
    brightness = list(range(0, 70, 4)) + list(range(70, 0, -4))
    hub.display.animate([Icon.HEART * i / 100 for i in brightness], 120)
    # while hub.buttons.pressed():
    #     wait(10)
    hub.system.set_stop_button([Button.LEFT, Button.RIGHT])
except ImportError:
    pass

# Allocates small buffer so the IDE can send us mode index
# values for each sensor.
app_data = AppData("b" * len(ports))

# This is sent when a device is plugged in if it has multiple modes.
# This populates a dropdown menu in the IDE to select the mode.
def make_mode_message(port, type_id, modes):
    return f"{port}\t{type_id}\tmodes\t" + "\t".join(modes) + "\r\n"


# BOOST Color and Distance Sensor
def update_color_and_distance_sensor(port, type_id, mode):
    sensor = ColorDistanceSensor(port)
    mode_info = make_mode_message(
        port,
        type_id,
        ["Reflected light intensity and color", "Ambient light intensity", "Distance"],
    )
    while True:
        if mode == 0:
            hsv = sensor.hsv()
            intensity = sensor.reflection()
            data = f"h={hsv.h}°, s={hsv.s}%, v={hsv.v}%, i={intensity}%"
        elif mode == 1:
            data = f"a={sensor.ambient()}%"
        else:
            data = f"d={sensor.distance()}%"
        yield mode_info + f"{port}\t{type_id}\t{data}"
        mode_info = ""


# SPIKE Prime / MINDSTORMS Robot Inventor Color Sensor
def update_color_sensor(port, type_id, mode):
    sensor = ColorSensor(port)
    mode_info = make_mode_message(
        port,
        type_id,
        [
            "Reflected light intensity and color",
            "Ambient light intensity and color",
        ],
    )
    while True:
        hsv = sensor.hsv(False if mode else True)
        color = str(sensor.color(False if mode else True)).replace("Color.","")
        intensity = sensor.ambient() if mode else sensor.reflection()
        yield mode_info + f"{port}\t{type_id}\tc={color}\th={hsv.h}°\ts={hsv.s}%\tv={hsv.v}%\ti={intensity}%"
        mode_info = ""


# WeDo 2.0 Tilt Sensor
def update_tilt_sensor(port, type_id):
    sensor = TiltSensor(port)
    while True:
        pitch, roll = sensor.tilt()
        yield f"{port}\t{type_id}\tp={pitch}°\tr={roll}°"


# WeDo 2.0 Infrared Sensor
def update_infrared_sensor(port, type_id):
    sensor = InfraredSensor(port)
    while True:
        dist = sensor.distance()
        ref = sensor.reflection()
        yield f"{port}\t{type_id}\td={dist}%\ti={ref}%"


# SPIKE Prime / MINDSTORMS Robot Inventor Ultrasonic Sensor
def update_ultrasonic_sensor(port, type_id):
    sensor = UltrasonicSensor(port)
    while True:
        yield f"{port}\t{type_id}\t{sensor.distance()}mm"


# SPIKE Prime Force Sensor
def update_force_sensor(port, type_id):
    sensor = ForceSensor(port)
    while True:
        yield f"{port}\t{type_id}\t{sensor.force()}N\t{sensor.distance()}mm"


# Any motor with rotation sensors.
def update_motor(port, type_id):
    motor = Motor(port)
    while True:
        angle = motor.angle()
        angle_mod = motor.angle() % 360
        if angle_mod > 180:
            angle_mod -= 360
        rotations = round((angle - angle_mod) / 360)
        velocity = motor.speed()
        msg = f"{port}\t{type_id}\ta={motor.angle()}°\tv={velocity}mms"
        if angle != angle_mod:
            msg += f"\tr={rotations}R\tra={angle_mod}°"
        yield msg


# Any motor without rotation sensors.
def update_dc_motor(port, type_id):
    while True:
        motor = DCMotor(port)
        yield f"{port}\t{type_id}"


# Any unknown Powered Up device.
def unknown_pup_device(port, type_id):
    while True:
        PUPDevice(port)
        yield f"{port}\t{type_id}\tunknown"


# Monitoring task for one port.
def device_task(port):

    while True:
        try:
            # Use generic class to find device type.
            dev = PUPDevice(port)
            type_id = dev.info()["id"]

            # Incoming app data can be used to set the device mode.
            mode = app_data.get_values()[ports.index(port)]

            # Run device specific monitoring task until it is disconnected.
            if type_id == 34:
                yield from update_tilt_sensor(port, type_id)
            if type_id == 35:
                yield from update_infrared_sensor(port, type_id)
            if type_id == 37:
                yield from update_color_and_distance_sensor(port, type_id, mode)
            elif type_id == 61:
                yield from update_color_sensor(port, type_id, mode)
            elif type_id == 62:
                yield from update_ultrasonic_sensor(port, type_id)
            elif type_id == 63:
                yield from update_force_sensor(port, type_id)
            elif type_id in (1, 2):
                yield from update_dc_motor(port, type_id)
            elif type_id in (38, 46, 47, 48, 49, 65, 75, 76):
                yield from update_motor(port, type_id)
            else:
                yield from unknown_pup_device(port, type_id)
        except OSError:
            # No device or previous device was disconnected.
            yield f"{port}\t--"


# Monitoring task for the hub core.
def hub_task():
    name = hub.system.name()
    
    # Name does not change, therefore send it only once.
    yield f'hub\tn={name}\tv={version}'

    # Send values repeatedly.
    while True:
        percentage = round(min(100,(hub.battery.voltage()-6000)/(8300-6000)*100))
        voltage = hub.battery.voltage()
        status = hub.charger.status()
        yield f'battery\tpct={percentage}%\tv={voltage}mV\ts={status}'

        # skip cc 10 seconds before sending an update 
        yield from (None for _ in range(100))


# Monitoring task for the hub buttons.
def buttons_task():
    while True:
        buttons = ",".join(sorted(str(b).replace("Button.","") for b in hub.buttons.pressed()))
        yield f'buttons\t{buttons}'


# # Monitoring task for the hub imu.
# def imu_task():
#     while True:
#         heading = hub.imu.heading()
#         stationary = 1 if hub.imu.stationary() else 0
#         yield f'imu\th={heading}\tsta={stationary}'


# Assemble all monitoring tasks.
tasks = [device_task(port) for port in ports] + \
            [hub_task(), buttons_task()]
            # imu_task()


# Main monitoring loop.
while True:

    # Get the messages for each sensor.
    msg = ""
    for task in tasks:
        line = next(task)
        if line: msg += line + "\r\n"

    # REVISIT: It would be better to send whole messages (or multiples), but we
    # are currently limited to 19 bytes per message, so write in chunks.
    for i in range(0, len(msg), 19):
        app_data.write_bytes(msg[i : i + 19])

    # Loop time.
    wait(100)
