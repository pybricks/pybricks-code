// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { prototype } from 'events';
import { AnchorButton, Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import { string } from 'prop-types';
import React, { useContext, useEffect, useId, useState } from 'react';
import { useDispatch } from 'react-redux';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import { hubStartRepl } from '../hub/actions';
import { useSelector } from '../reducers';
import ActionButton from '../toolbar/ActionButton';
import colorsensorIcon from './colorsensor.svg';
import forcesensorIcon from './forcesensor.svg';
import hubIcon from './hub.svg';
import { useI18n } from './i18n';
import motorIcon from './motor.svg';
import PortDetail from './portdetail';
import ussensorIcon from './ussensor.svg';

// interface PortComponentProps {
//     porttype: number | undefined;
//     portvalue: string | undefined;
//     // children?: React.ReactNode;
// }

type PortComponentProps = PortDetail;

const PortComponent: React.FunctionComponent<PortComponentProps> = ({
    porttype,
    portvalue,
}) => {
    const renderPort = () => {
        switch (porttype) {
            case 48:
            case 49:
            case 65:
            case 75:
            case 76:
                return <img src={motorIcon} />;
            case 63:
                return <img src={forcesensorIcon} />;
            case 61:
                return <img src={colorsensorIcon} />;
            case 62:
                return <img src={ussensorIcon} />;
            default:
                return <></>;
        }
    };

    return (
        <div>
            {renderPort()}
            <div className="value">{portvalue}</div>
        </div>
    );
};

export default PortComponent;
