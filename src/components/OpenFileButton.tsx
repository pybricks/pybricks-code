// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Button, Intent, Position, Spinner, Tooltip } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';
import { tooltipDelay } from '../settings/ui';
import { TooltipId } from './button-i18n';
import en from './button-i18n.en.json';

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

type Props = OpenFileButtonProps & WithI18nProps;

/**
 * Button that opens a file chooser dialog or accepts files dropped on it.
 */
class OpenFileButton extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.onDropAccepted = this.onDropAccepted.bind(this);
        this.onDropRejected = this.onDropRejected.bind(this);
    }

    private onDropAccepted(acceptedFiles: File[]): void {
        // should only be one file since multiple={false}
        acceptedFiles.forEach((f) => {
            const reader = new FileReader();

            reader.onabort = (): void => console.error('file reading was aborted');
            reader.onerror = (): void => console.error('file reading has failed');
            reader.onload = (): void => {
                const binaryStr = reader.result;
                if (binaryStr === null) {
                    throw Error('Unexpected null binaryStr');
                }
                if (typeof binaryStr === 'string') {
                    throw Error('Unexpected string binaryStr');
                }
                this.props.onFile(binaryStr);
            };
            reader.readAsArrayBuffer(f);
        });
    }

    private onDropRejected(fileRejections: FileRejection[]): void {
        // should only be one file since multiple={false}
        fileRejections.forEach((r) => {
            this.props.onReject(r.file);
        });
    }

    render(): JSX.Element {
        return (
            <Dropzone
                onDropAccepted={this.onDropAccepted}
                onDropRejected={this.onDropRejected}
                accept={this.props.fileExtension}
                multiple={false}
                noClick={this.props.onClick !== undefined}
                noKeyboard={this.props.onClick !== undefined}
            >
                {({ getRootProps, getInputProps }): JSX.Element => (
                    <Tooltip
                        content={this.props.i18n.translate(
                            this.props.tooltip,
                            this.props.tooltip === TooltipId.FlashProgress
                                ? {
                                      percent:
                                          this.props.progress === undefined
                                              ? ''
                                              : this.props.i18n.formatPercentage(
                                                    this.props.progress,
                                                ),
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
                                disabled={this.props.enabled === false}
                                className="no-box-shadow"
                                style={
                                    this.props.enabled === false
                                        ? { pointerEvents: 'none' }
                                        : undefined
                                }
                                // onClick={this.props.onClick}
                                // breaks Dropzone when this.props.onClick is undefined
                                // so we have to do it the long way
                                {...(this.props.onClick
                                    ? { onClick: this.props.onClick }
                                    : {})}
                            >
                                <input {...getInputProps()} />
                                {this.props.showProgress ? (
                                    <Spinner
                                        value={this.props.progress}
                                        intent={Intent.PRIMARY}
                                    />
                                ) : (
                                    <img src={this.props.icon} alt={this.props.id} />
                                )}
                            </Button>
                        </div>
                    </Tooltip>
                )}
            </Dropzone>
        );
    }
}

export default withI18n({ id: 'openFileButton', fallback: en, translations: { en } })(
    OpenFileButton,
);
