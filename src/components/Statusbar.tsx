import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { BLEConnectionState } from '../reducers/ble';

interface StatusBarState {
    bleState: BLEConnectionState;
}

class StatusBar extends React.Component<{}, StatusBarState> {
    constructor(props: {}) {
        super(props);
        this.state = { bleState: BLEConnectionState.Disconnected };
        this.onAction = this.onAction.bind(this);
    }

    private onAction(action: string): void {
        console.log(action);
    }

    setBLEState(state: BLEConnectionState): void {
        this.setState({ bleState: state });
    }

    render(): JSX.Element {
        return (
            <div className="bg-info p-2">
                <ProgressBar className="w-25"></ProgressBar>
            </div>
        );
    }
}

export default StatusBar;
