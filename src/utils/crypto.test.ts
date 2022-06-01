// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { sha256Digest } from './crypto';

test('sha256Digest', async () => {
    await expect(sha256Digest('test')).resolves.toBe(
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    );
});
