// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { IToastOptions, ToastProps, ToasterInstance } from '@blueprintjs/core';
import { waitFor } from '@testing-library/dom';
import { AsyncSaga } from '../../test';
import { alertsDidShowAlert, alertsShowAlert } from './actions';
import alerts from './sagas';

afterEach(() => {
    jest.clearAllMocks();
});

class TestToaster implements ToasterInstance {
    private toasts = new Array<IToastOptions>();

    public getToasts(): IToastOptions[] {
        return this.toasts;
    }

    public show(props: ToastProps, key?: string): string {
        if (!key) {
            throw new Error('key is required!');
        }

        this.toasts.push({ key, ...props });

        return key;
    }

    public dismiss(key: string): void {
        const index = this.toasts.findIndex((t) => t.key === key);

        if (index < 0) {
            return;
        }

        const toast = this.toasts.at(index);
        toast?.onDismiss?.(false);

        this.toasts.splice(index, 1);
    }

    public clear(): void {
        throw new Error('this method should never be called!');
    }
}

describe('handleShowAlert', () => {
    let toaster: TestToaster;
    let saga: AsyncSaga;

    beforeEach(async () => {
        toaster = new TestToaster();
        jest.spyOn(toaster, 'show');
        jest.spyOn(toaster, 'dismiss');
        saga = new AsyncSaga(alerts, { toaster });
    });

    it('should show toast', async () => {
        saga.put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: { name: 'TestError', message: 'test error' },
            }),
        );

        expect(toaster.dismiss).not.toHaveBeenCalled();
        expect(toaster.show).toHaveBeenCalled();

        toaster.dismiss(toaster.getToasts().at(-1)?.key ?? '');

        await expect(saga.take()).resolves.toEqual(
            alertsDidShowAlert('alerts', 'unexpectedError', 'dismiss'),
        );
    });

    it('should show close and re-open toast with same key', async () => {
        // request to show the same alert twice
        saga.put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: { name: 'TestError', message: 'test error' },
            }),
        );
        saga.put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: { name: 'TestError', message: 'test error' },
            }),
        );

        // at this point, show has only been called once to display the first alert
        expect(toaster.show).toHaveBeenCalled();
        // and then dismiss was called to close it
        expect(toaster.dismiss).toHaveBeenCalled();

        // which should result in an action
        await expect(saga.take()).resolves.toEqual(
            alertsDidShowAlert('alerts', 'unexpectedError', 'dismiss'),
        );

        // then after a delay, the second alert is shown
        await waitFor(() => expect(toaster.show).toHaveBeenCalledTimes(2));

        // then we dismiss it manually, like normal
        toaster.dismiss(toaster.getToasts().at(-1)?.key ?? '');

        // and get the action for the second dismiss
        await expect(saga.take()).resolves.toEqual(
            alertsDidShowAlert('alerts', 'unexpectedError', 'dismiss'),
        );
    });

    afterEach(async () => {
        await saga.end();
    });
});
