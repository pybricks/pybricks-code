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
from pybricks.parameters import Port, Stop
from pybricks.tools import wait, AppData
try:
    from pybricks.iodevices import PUPDevice
except:
    pass

# Figure out the available ports for the given hub.
ports = [Port.A, Port.B]
try:
    ports += [Port.C, Port.D]
    ports += [Port.E, Port.F]
except AttributeError:
    pass
port_modes = [0] * len(ports)
devices = {}

from pybricks.hubs import ThisHub
hub = ThisHub
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


# Allocates small buffer so the IDE can send us commands,
# mode index values for each sensor.
# message format            version:1, packet_counter:1, message_type:1, payload:3-max
# execute_action            "a"             # 'a' + action_name:1
#   shutdown                "as"
# port_operations           "p"             # port_index:1, operation:1, values:1
#   set_port_mode           "p\0x00m\0x00"
#   rotate motor            "p\0x00r\0x01"
app_data = AppData("1b1b1b3b")
def get_app_data_input():
    version, packet_counter, message_type, *payload = app_data.get_values()
    if version != 1:
        return 0, 0, 0
    else:
        return message_type, packet_counter, payload


# This is sent when a device is plugged in if it has multiple modes.
# This populates a dropdown menu in the IDE to select the mode.
def make_mode_message(port, type_id, modes):
    return f"{port}\t{type_id}\tmodes\t" + "\t".join(modes) + "\r\n"


# BOOST Color and Distance Sensor
def update_color_and_distance_sensor(port, type_id):
    devices[port] = sensor = ColorDistanceSensor(port)
    mode_info = make_mode_message(
        port,
        type_id,
        ["Reflected light intensity and color", "Ambient light intensity", "Distance"],
    )
    while True:
        # mode = app_data.get_values()[ports.index(port)]
        mode = port_modes[ports.index(port)]
        if mode == 0:
            hsv = sensor.hsv()
            intensity = sensor.reflection()
            color = str(sensor.color()).replace("Color.","")
            data = f"c={color}\th={hsv.h}°\ts={hsv.s}%\tv={hsv.v}%\ti={intensity}%"
        elif mode == 1:
            data = f"i={sensor.ambient()}%"
        else:
            data = f"d={sensor.distance()}%"
        yield mode_info + f"{port}\t{type_id}\t{data}"
        mode_info = ""


# SPIKE Prime / MINDSTORMS Robot Inventor Color Sensor
def update_color_sensor(port, type_id):
    devices[port] = sensor = ColorSensor(port)
    mode_info = make_mode_message(
        port,
        type_id,
        [
            "Reflected light intensity and color",
            "Ambient light intensity and color",
        ],
    )
    while True:
        mode = port_modes[ports.index(port)]
        # mode = app_data.get_values()[ports.index(port)]
        hsv = sensor.hsv(False if mode else True)
        color = str(sensor.color(False if mode else True)).replace("Color.","")
        intensity = sensor.ambient() if mode else sensor.reflection()
        data = f"c={color}\th={hsv.h}°\ts={hsv.s}%\tv={hsv.v}%\ti={intensity}%"
        yield mode_info + f"{port}\t{type_id}\t{data}"
        mode_info = ""


# WeDo 2.0 Tilt Sensor
def update_tilt_sensor(port, type_id):
    devices[port] = sensor = TiltSensor(port)
    while True:
        pitch, roll = sensor.tilt()
        data = f"p={pitch}°\tr={roll}°"
        yield f"{port}\t{type_id}\t{data}"


# WeDo 2.0 Infrared Sensor
def update_infrared_sensor(port, type_id):
    devices[port] = sensor = InfraredSensor(port)
    while True:
        dist = sensor.distance()
        ref = sensor.reflection()
        data = f"d={dist}%\ti={ref}%"
        yield f"{port}\t{type_id}\t{data}"


# SPIKE Prime / MINDSTORMS Robot Inventor Ultrasonic Sensor
def update_ultrasonic_sensor(port, type_id):
    devices[port] = sensor = UltrasonicSensor(port)
    while True:
        data = f"d={sensor.distance()}mm"
        yield f"{port}\t{type_id}\t{data}"


# SPIKE Prime Force Sensor
def update_force_sensor(port, type_id):
    devices[port] = sensor = ForceSensor(port)
    while True:
        data = f"f={sensor.force():.2f}N\td={sensor.distance():.2f}mm"
        yield f"{port}\t{type_id}\t{data}"


# Any motor with rotation sensors.
def update_motor(port, type_id):
    devices[port] = motor = Motor(port)
    while True:
        angle = motor.angle()
        angle_mod = motor.angle() % 360
        if angle_mod > 180:
            angle_mod -= 360
        rotations = round((angle - angle_mod) / 360)
        data = f"a={motor.angle()}°"
        if angle != angle_mod:
            data += f"\tr={rotations}R\tra={angle_mod}°"
        msg = f"{port}\t{type_id}\t{data}"
        yield msg


# Any motor without rotation sensors.
def update_dc_motor(port, type_id):
    devices[port] = motor = DCMotor(port)
    while True:
        yield f"{port}\t{type_id}"


# Any unknown Powered Up device.
def unknown_pup_device(port, type_id):
    devices[port] = PUPDevice(port)
    while True:
        yield f"{port}\t{type_id}\tunknown"


# Monitoring task for one port.
def device_task(port):

    while True:
        try:
            # Use generic class to find device type.
            dev = PUPDevice(port)
            type_id = dev.info()["id"]

            # Run device specific monitoring task until it is disconnected.
            if type_id == 34:
                yield from update_tilt_sensor(port, type_id)
            if type_id == 35:
                yield from update_infrared_sensor(port, type_id)
            if type_id == 37:
                yield from update_color_and_distance_sensor(port, type_id)
            elif type_id == 61:
                yield from update_color_sensor(port, type_id)
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
    global last_packet_counter
    last_packet_counter = -1
    while True:
        message_type, packet_counter, payload = get_app_data_input()

        if packet_counter != last_packet_counter:

            # execute_action
            last_packet_counter = packet_counter
            if message_type == ord("a"):
                if payload[0] == ord("s"):
                    # execute_action: shutdown
                    try: hub.speaker.beep()
                    except: pass
                    yield hub.system.shutdown()
                if payload[0] == ord("h"):
                    # execute_action: shutdown
                    yield hub.display.text("Hello")
            # port_operations
            elif message_type == ord("p"):
                port_index = payload[0]
                port_operation = payload[1]

                # set_port_mode
                if port_operation == ord("m"):
                    port_modes[port_index] = payload[2]
                # rotate motor
                elif port_operation == ord("r"):
                    direction = payload[2]
                    # assume it is a motor instance, if not, exception will be handled centrally
                    devices[ports[port_index]].run_time(100 * direction, 300, Stop.COAST_SMART)

        yield None


def battery_task():
    if not hub.battery: return

    count = 0
    while True:
        count += 1
        if count % 100:
            yield None
        else:
            # skip cc 10 seconds before sending an update 
            percentage = round(min(100,(hub.battery.voltage()-6000)/(8300-6000)*100))
            voltage = hub.battery.voltage()
            status = hub.charger.status()
            data = f"pct={percentage}%\tv={voltage}mV\ts={status}"
            yield f"battery\t{data}"


# # Monitoring task for the hub buttons.
# def buttons_task():
#     while True:
#         buttons = ",".join(sorted(str(b).replace("Button.","") for b in hub.buttons.pressed()))
#         yield f'buttons\t{buttons}'


# Monitoring task for the hub imu.
def imu_task():
    if not hub.imu: return
    while True:
        heading = round(hub.imu.heading())
        # [pitch, roll] = hub.imu.tilt()
        pitch = round(hub.imu.tilt()[0])
        roll = round(hub.imu.tilt()[1])
        stationary = 1 if hub.imu.stationary() else 0
        up = str(hub.imu.up()).replace("Side.","")
        yield f"imu\tup={up}\ty={heading}°\tp={pitch}°\tr={roll}°\ts={stationary}"


# Assemble all monitoring tasks.
tasks = [device_task(port) for port in ports] + \
            [hub_task(), battery_task(), imu_task()]


# Main monitoring loop.
while True:

    # Get the messages for each sensor.
    msg = ""
    for task in tasks:
        try:
            line = next(task)
            if line: msg += line + "\r\n"
        except Exception as e:
            pass

    # REVISIT: It would be better to send whole messages (or multiples), but we
    # are currently limited to 19 bytes per message, so write in chunks.
    if PUPDevice:
        for i in range(0, len(msg), 19):
            app_data.write_bytes(msg[i : i + 19])
    else:
        print(msg)

    # Loop time.
    wait(100)
