// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { put, takeEvery } from 'typed-redux-saga/macro';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import { fileStorageWriteFile } from '../fileStorage/actions';
import { explorerCreateNewFile } from './actions';

function* handleExplorerCreateNewFile(
    action: ReturnType<typeof explorerCreateNewFile>,
): Generator {
    const fileName = `${action.fileName}${action.fileExtension}`;

    yield* put(
        fileStorageWriteFile(
            fileName,
            getPybricksMicroPythonFileTemplate(action.hub) || '',
        ),
    );
}

export default function* (): Generator {
    yield* takeEvery(explorerCreateNewFile, handleExplorerCreateNewFile);
}
