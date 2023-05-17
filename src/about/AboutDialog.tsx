// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// The about dialog

import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';
import { firmwareVersion } from '@pybricks/firmware';
import React, { useState } from 'react';
import {
    appName,
    appVersion,
    changelogUrl,
    legoDisclaimer,
    legoRegisteredTrademark,
    pybricksCopyright,
    pybricksWebsiteUrl,
} from '../app/constants';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import LicenseDialog from '../licenses/LicenseDialog';
import { useI18n } from './i18n';
import icon from './icon.svg';

import './about.scss';

type AboutDialogProps = { isOpen: boolean; onClose: () => void };

const AboutDialog: React.FunctionComponent<AboutDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false);

    const i18n = useI18n();

    return (
        <Dialog
            title={i18n.translate('title', { appName })}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={Classes.DIALOG_BODY}>
                <div className="pb-about-icon">
                    <img src={icon} alt="Pybricks logo" />
                </div>
                <p>
                    <strong>
                        {i18n.translate('description', {
                            lego: legoRegisteredTrademark,
                        })}
                    </strong>
                </p>
                <p>{`v${firmwareVersion} (${appName} v${appVersion})`}</p>
                <p>{pybricksCopyright}</p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <p>
                    <small>{legoDisclaimer}</small>
                </p>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button onClick={() => setIsLicenseDialogOpen(true)}>
                        {i18n.translate('licenseButton.label')}
                    </Button>
                    <AnchorButton href={changelogUrl} target="blank_">
                        {i18n.translate('changelogButton.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton href={pybricksWebsiteUrl} target="blank_">
                        {i18n.translate('websiteButton.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                </div>
            </div>
            <LicenseDialog
                isOpen={isLicenseDialogOpen}
                onClose={() => setIsLicenseDialogOpen(false)}
            />
        </Dialog>
    );
};

export default AboutDialog;
