// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

const googleOauthTokenExpirationStorageKey = 'google_oauth_token_expiration';
const googleOauthTokenStorageKey = 'google_oauth_token';

export function getStoredOauthToken(): string {
    const tokenExpiration = sessionStorage.getItem(
        googleOauthTokenExpirationStorageKey,
    );
    if (!tokenExpiration || Date.now() > parseInt(tokenExpiration)) {
        return '';
    }

    return sessionStorage.getItem(googleOauthTokenStorageKey) || '';
}
export function saveOauthToken(authToken: string, expireIn: number) {
    console.log('auth token updated');
    sessionStorage.setItem(googleOauthTokenStorageKey, authToken);
    sessionStorage.setItem(
        googleOauthTokenExpirationStorageKey,
        (1000 * expireIn + Date.now()).toString(),
    );
}
