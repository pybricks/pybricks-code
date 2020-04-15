/**
 * Describes the state of the BLE connection.
 */
enum BLEConnectionState {
    /**
     * No device is connected.
     */
    Disconnected,
    /**
     * Scanning for devices.
     */
    Scanning,
    /**
     * Connecting to a device.
     */
    Connecting,
    /**
     * Connected, waiting for a command.
     */
    Waiting,
    /**
     * Connected, busy downloading a user program.
     */
    Downloading,
    /**
     * Connected, running a user program.
     */
    Running,
    /**
     * Connected, running REPL.
     */
    REPL,
}

export { BLEConnectionState };
