// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import React, { useCallback, useEffect, useState } from 'react';
import { OverlayContainer } from 'react-aria';
import { useBoolean } from 'usehooks-ts';
import { Button } from './Button';
import HelpDialog from './HelpDialog';
import { I18nId, useI18n } from './i18n';

type HelpButtonProps = {
    /** The label of the control this button provides help for. */
    helpForLabel: string;
    /** The help dialog content. */
    content: React.ReactNode;
};

const HelpButton: React.VoidFunctionComponent<HelpButtonProps> = ({
    helpForLabel,
    content,
}) => {
    const i18n = useI18n();

    const {
        value: isDialogOpen,
        setTrue: setIsDialogOpenTrue,
        setFalse: setIsDialogOpenFalse,
    } = useBoolean(false);

    const [isDialogMounted, setIsDialogMounted] = useState(false);

    // isDialogMounted=true is triggered on isDialogOpen==true rising edge
    useEffect(() => {
        if (isDialogOpen) {
            setIsDialogMounted(true);
        }
    }, [isDialogOpen, setIsDialogMounted]);

    // isDialogMounted=false is triggered when isDialogOpen==false and the animation ends
    const handleAnimationEnd = useCallback(() => {
        if (!isDialogOpen) {
            setIsDialogMounted(false);
        }
    }, [isDialogOpen, setIsDialogMounted]);

    const [openButton, setOpenButton] = useState<HTMLButtonElement | null>(null);

    return (
        <>
            <Button
                label={i18n.translate(I18nId.HelpButtonLabel)}
                hideLabel
                description={i18n.translate(I18nId.HelpButtonDescription, {
                    helpForLabel,
                })}
                minimal
                icon="help"
                elementRef={setOpenButton}
                onPress={setIsDialogOpenTrue}
            />
            {isDialogMounted && (
                <OverlayContainer className={Classes.PORTAL}>
                    <HelpDialog
                        title={i18n.translate(I18nId.HelpDialogTitle)}
                        isOpen={isDialogOpen}
                        openButton={openButton}
                        onClose={setIsDialogOpenFalse}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        {content}
                    </HelpDialog>
                </OverlayContainer>
            )}
        </>
    );
};

export default HelpButton;
