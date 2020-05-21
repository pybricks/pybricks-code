import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { connect } from 'react-redux';
import { RootState } from '../reducers';

type StateProps = { progress: number };

type StatusProps = StateProps;

class StatusBar extends React.Component<StatusProps> {
    render(): JSX.Element {
        return (
            <div className="bg-info p-2">
                <ProgressBar className="w-25" now={this.props.progress} />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    progress: state.status.progress,
});

export default connect(mapStateToProps)(StatusBar);
