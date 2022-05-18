// helper functions for React components

import { useState } from 'react';
import { createCountFunc } from './iter';

const nextId = createCountFunc();

/**
 * React hook to get a unique identifier, e.g. for linking components via
 * aria-labelledby.
 *
 * @param prefix A namespace prefix for the identifier.
 * @returns A unique identifier in the form "prefix-N"
 */
export const useUniqueId = (prefix: string): string => {
    const [uniqueId] = useState(`${prefix}-${nextId()}`);
    return uniqueId;
};
