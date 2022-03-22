// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Provides special notification contents for unexpected errors.

import { AnchorButton, Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { I18nId } from './i18n';

type UnexpectedErrorNotificationProps = {
    messageId: I18nId;
    err: Error;
};

const UnexpectedErrorNotification: React.VoidFunctionComponent<
    UnexpectedErrorNotificationProps
> = ({ messageId, err }) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return (
        <>
            <p>{i18n.translate(messageId, { errorMessage: err.message })}</p>
            <div>
                <ButtonGroup minimal={true} fill={true}>
                    <Button
                        intent={Intent.DANGER}
                        icon="duplicate"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `\`\`\`\n${err.stack || err.message}\n\`\`\``,
                            )
                        }
                    >
                        {i18n.translate(I18nId.CopyErrorMessage)}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon="virus"
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(err.message)}`}
                        target="_blank"
                    >
                        {i18n.translate(I18nId.ReportBug)}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
};

export default UnexpectedErrorNotification;
