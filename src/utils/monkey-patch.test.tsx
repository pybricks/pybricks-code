// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Button, IRef } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useTooltip2MonkeyPatch } from './monkey-patch';

const testTooltipText = 'Test tooltip.';
const testButtonId = 'test-button';

type TestComponentProps = { monkeyPatch: boolean };

const TestComponent: React.FC<TestComponentProps> = (props) => {
    const tooltipRef = props.monkeyPatch ? useTooltip2MonkeyPatch() : undefined;

    return (
        <Tooltip2
            ref={tooltipRef}
            content={testTooltipText}
            renderTarget={({
                ref: tooltipTargetRef,
                isOpen: _tooltipIsOpen,
                ...tooltipTargetProps
            }) => (
                <Button
                    data-testid={testButtonId}
                    elementRef={tooltipTargetRef as IRef<HTMLButtonElement>}
                    {...tooltipTargetProps}
                >
                    Press Me!
                </Button>
            )}
        />
    );
};

it.each([false, true])(
    'should work around https://github.com/palantir/blueprint/issues/4503',
    async (monkeyPatch) => {
        render(<TestComponent monkeyPatch={monkeyPatch} />);

        expect(screen.queryByText(testTooltipText)).not.toBeInTheDocument();

        // pressing the tab key should focus the button and open the tooltip
        userEvent.tab();

        await waitFor(() => {
            expect(screen.getByText(testTooltipText)).toBeInTheDocument();
        });

        // a blur event with renderTarget=null should trigger the bug and workaround
        fireEvent.blur(screen.getByTestId(testButtonId));

        if (monkeyPatch) {
            // if the patch was applied, there should not be any error
            await waitForElementToBeRemoved(screen.getByText(testTooltipText));
        } else {
            // if the patch was not applied, the bug should be triggered
            await expect(
                waitForElementToBeRemoved(screen.getByText(testTooltipText)),
            ).rejects.toBeInstanceOf(Error);
        }
    },
);
