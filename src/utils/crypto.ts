// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

const encoder = new TextEncoder();

export async function sha256Digest(data: string): Promise<string> {
    const hash = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(hash))
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('');
}
