// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { useEffect, useState } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';
import { docsDefaultPage, httpServerHeadersVersion } from './constants';

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

    // Add a state variable for the current page
    const [currentPage, setCurrentPage] = useState(lastPageSessionSetting);

    // mirror session storage value to local storage
    useEffect(() => {
        setLastPageGlobalSetting(lastPageSessionSetting);
        setCurrentPage(lastPageSessionSetting); // Update the current page
    }, [lastPageSessionSetting, setLastPageGlobalSetting]);

    // Modify setLastDocsPage to update the current page
    const setLastDocsPage = (url: string) => {
        setLastPageSessionSetting(url);
        setCurrentPage(url);
    };
    return { initialDocsPage: currentPage, setLastDocsPage };
}
