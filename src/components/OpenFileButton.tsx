import React from 'react';
import Dropzone from 'react-dropzone';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Image from 'react-bootstrap/Image';

export interface OpenFileButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** The accepted file extension */
    readonly fileExtension: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: string;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
    /** Callback that is called when the button is activated (clicked). */
    readonly onFile: (data: ArrayBuffer) => void;
}

/**
 * Button that opens a file chooser dialog or accepts files dropped on it.
 */
class OpenFileButton extends React.Component<OpenFileButtonProps> {
    constructor(props: OpenFileButtonProps) {
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

    private onDropRejected(rejectedFiles: File[]): void {
        // should only be one file since multiple={false}
        rejectedFiles.forEach((f) => {
            // TODO: proper bootstrap toast
            alert(`bad file ${f.name}`);
        });
    }

    render(): JSX.Element {
        return (
            <Dropzone
                onDropAccepted={this.onDropAccepted}
                onDropRejected={this.onDropRejected}
                accept={this.props.fileExtension}
                multiple={false}
            >
                {({ getRootProps, getInputProps }): JSX.Element => (
                    <OverlayTrigger
                        placement="bottom"
                        overlay={
                            <Tooltip id={`${this.props.id}-tooltip`}>
                                {this.props.tooltip}.
                            </Tooltip>
                        }
                    >
                        <Button
                            {...getRootProps()}
                            variant="primary"
                            disabled={this.props.enabled === false}
                            style={
                                this.props.enabled === false
                                    ? { pointerEvents: 'none' }
                                    : undefined
                            }
                        >
                            <input {...getInputProps()} />
                            <Image
                                src={`/static/images/${this.props.icon}`}
                                alt={this.props.id}
                            />
                        </Button>
                    </OverlayTrigger>
                )}
            </Dropzone>
        );
    }
}

export default OpenFileButton;
