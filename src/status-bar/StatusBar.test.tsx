import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { rootReducer } from '../reducers';
import StatusBar from './StatusBar';

it('should prevent browser context menu', () => {
    const store = createStore(rootReducer);
    render(
        <Provider store={store}>
            <StatusBar />
        </Provider>,
    );

    expect(fireEvent.contextMenu(screen.getByRole('status'))).toBe(false);
});
