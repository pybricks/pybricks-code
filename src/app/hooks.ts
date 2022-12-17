// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useEffect, useMemo } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';
import { docsDefaultPage, docsPathPrefix, httpServerHeadersVersion } from './constants';

const defaultPage = `${docsDefaultPage}?v$${httpServerHeadersVersion}`;

export function useAppLastDocsPageSetting() {
    const key = 'app.setting.lastDocsPage';

    // last visited page is stored in local storage so that new windows get the
    // last visited page
    const [lastPageGlobalSetting, setLastPageGlobalSetting] = useLocalStorage(
        key,
        defaultPage,
    );

    // it is also stored in session storage in case two windows are open at the
    // same time so that one window doesn't affect the other
    const [lastPageSessionSetting, setLastPageSessionSetting] = useSessionStorage(
        key,
        lastPageGlobalSetting,
    );

    // mirror session storage value to local storage
    useEffect(() => {
        setLastPageGlobalSetting(lastPageSessionSetting);
    }, [lastPageSessionSetting, setLastPageGlobalSetting]);

    // the way the docs control works, we only provide the initial page, then
    // it manages navigation after that, so we only want the initial of this
    // value when the app first starts
    const initialDocsPage = useMemo(
        () => {
            try {
                const url = new URL(lastPageSessionSetting);

                // in case someone is hacking the storage value directly
                if (!url.pathname.startsWith(`/${docsPathPrefix}`)) {
                    throw new Error('invalid or outdated path');
                }

                return lastPageSessionSetting;
            } catch {
                return defaultPage;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [], // no deps so that we only get the initial value
    );

    return { initialDocsPage, setLastDocsPage: setLastPageSessionSetting };
}
