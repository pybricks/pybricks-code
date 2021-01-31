import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import StatusBar from './StatusBar';

it('should prevent browser context menu', () => {
    const store = ({
        getState: jest.fn(),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    } as unknown) as Store;
    render(
        <Provider store={store}>
            <StatusBar />
        </Provider>,
    );

    expect(fireEvent.contextMenu(screen.getByRole('status'))).toBe(false);
});
