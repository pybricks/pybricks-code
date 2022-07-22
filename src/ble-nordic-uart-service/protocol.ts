// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Definitions related to the nRF UART Bluetooth low energy GATT service.
//
// The Nordic Semiconductor nRF UART service is a defacto standard for providing
// serial communication using Bluetooth Low Energy.
// https://infocenter.nordicsemi.com/topic/sdk_nrf5_v16.0.0/ble_sdk_app_nus_eval.html

/** nRF UART Service UUID. */
export const nordicUartServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

/** nRF UART RX Characteristic UUID. Supports Write or Write without response. */
export const nordicUartRxCharUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

/** nRF UART TX Characteristic UUID. Supports Notifications. */
export const nordicUartTxCharUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

/**
 * This is the largest data size for the TX characteristic that is safe to use
 * when the negotiated MTU is unknown.
 */
export const nordicUartSafeTxCharLength = 20;
