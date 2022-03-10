// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { FileExtension, Hub, explorerCreateNewFile } from './actions';
import explorer from './sagas';

describe('handleExplorerCreateNewFile', () => {
    it('should dispatch fileStorage action', async () => {
        const saga = new AsyncSaga(explorer);

        saga.put(explorerCreateNewFile('test', FileExtension.Python, Hub.Technic));

        const action = await saga.take();
        expect(action).toMatchInlineSnapshot(`
            Object {
              "fileContents": "from pybricks.hubs import TechnicHub
            from pybricks.pupdevices import Motor
            from pybricks.parameters import Button, Color, Direction, Port, Stop
            from pybricks.robotics import DriveBase
            from pybricks.tools import wait, StopWatch

            hub = TechnicHub()

            ",
              "fileName": "test.py",
              "type": "fileStorage.action.writeFile",
            }
        `);

        await saga.end();
    });
});
