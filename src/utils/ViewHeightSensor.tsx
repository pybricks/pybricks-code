/* This is a hack for correctly sizing to view height on mobile when not running in fullscreen mode. */

import { ResizeSensor } from '@blueprintjs/core';
import React from 'react';

/* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */

function ViewHeightSensor(): JSX.Element {
    return (
        <ResizeSensor
            onResize={(e): void => {
                document.documentElement.style.setProperty(
                    '--pb-vh',
                    `${e[0].contentRect.height}px`,
                );
            }}
        >
            <div id="pb-vh" className="h-100 w-100 p-absolute" />
        </ResizeSensor>
    );
}

export default ViewHeightSensor;
