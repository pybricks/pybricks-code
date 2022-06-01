// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createContext } from 'react';
import { FileStorageDb } from '.';

export const db = new FileStorageDb('pybricks.fileStorage');

export const FileStorageContext = createContext(db);
