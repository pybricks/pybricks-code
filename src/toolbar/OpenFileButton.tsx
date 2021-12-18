// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Button, Intent, Position, Spinner, Tooltip } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import Dropzone from 'react-dropzone';
import { tooltipDelay } from '../app/constants';
import { TooltipId } from './i18n';
import en from './i18n.en.json';

export interface OpenFileButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** The accepted file extension */
    readonly fileExtension: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: TooltipId;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
    /** Show progress spinner instead of icon. */
    readonly showProgress?: boolean;
    /** The progress value (0 to 1) for the progress spinner. */
    readonly progress?: number;
    /** Callback that is called when a file has been selected and opened for reading. */
    readonly onFile: (data: ArrayBuffer) => void;
    /** Callback that is called when a file has been rejected (e.g. bad file extension). */
    readonly onReject: (file: File) => void;
    /** If defined, will call custom function instead of opening file browser. */
    readonly onClick?: () => void;
}

/**
 * Button that opens a file chooser dialog or accepts files dropped on it.
 */
const OpenFileButton: React.FC<OpenFileButtonProps> = (props) => {
    const [i18n] = useI18n({
        id: 'openFileButton',
        translations: { en },
        fallback: en,
    });

    return (
        <Dropzone
            accept={props.fileExtension}
            multiple={false}
            noClick={props.onClick !== undefined}
            noKeyboard={props.onClick !== undefined}
            onDropAccepted={(acceptedFiles) => {
                // should only be one file since multiple={false}
                acceptedFiles.forEach((f) => {
                    const reader = new FileReader();

                    reader.onabort = (): void =>
                        console.error('file reading was aborted');
                    reader.onerror = (): void =>
                        console.error('file reading has failed');
                    reader.onload = (): void => {
                        const binaryStr = reader.result;
                        if (binaryStr === null) {
                            throw Error('Unexpected null binaryStr');
                        }
                        if (typeof binaryStr === 'string') {
                            throw Error('Unexpected string binaryStr');
                        }
                        props.onFile(binaryStr);
                    };
                    reader.readAsArrayBuffer(f);
                });
            }}
            onDropRejected={(fileRejections) => {
                // should only be one file since multiple={false}
                fileRejections.forEach((r) => {
                    props.onReject(r.file);
                });
            }}
        >
            {({ getRootProps, getInputProps }): JSX.Element => (
                <Tooltip
                    content={i18n.translate(
                        props.tooltip,
                        props.tooltip === TooltipId.FlashProgress
                            ? {
                                  percent:
                                      props.progress === undefined
                                          ? ''
                                          : i18n.formatPercentage(props.progress),
                              }
                            : undefined,
                    )}
                    position={Position.BOTTOM}
                    hoverOpenDelay={tooltipDelay}
                >
                    <div
                        {...getRootProps()}
                        tabIndex={-1}
                        className="pb-open-file-button-root"
                    >
                        <Button
                            intent={Intent.PRIMARY}
                            disabled={props.enabled === false}
                            className="no-box-shadow"
                            style={
                                props.enabled === false
                                    ? { pointerEvents: 'none' }
                                    : undefined
                            }
                            onMouseDown={(e) => e.preventDefault()} // prevent focus
                            // onClick={this.props.onClick}
                            // breaks Dropzone when this.props.onClick is undefined
                            // so we have to do it the long way
                            {...(props.onClick ? { onClick: props.onClick } : {})}
                        >
                            <input {...getInputProps()} />
                            {props.showProgress ? (
                                <Spinner
                                    value={props.progress}
                                    intent={Intent.PRIMARY}
                                />
                            ) : (
                                <img src={props.icon} alt={props.id} />
                            )}
                        </Button>
                    </div>
                </Tooltip>
            )}
        </Dropzone>
    );
};

export default OpenFileButton;
