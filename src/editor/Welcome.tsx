// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// welcome screen that is shown when no editor is open.

import { Colors } from '@blueprintjs/core';
import React, { useEffect, useRef } from 'react';
import Two from 'two.js';
import { useTernaryDarkMode } from 'usehooks-ts';
import logoSvg from './logo.svg';

const defaultRotation = -Math.PI / 9; // radians
const rotationSpeedIncrement = 0.1; // radians per second

type State = {
    rotation: number;
    rotationSpeed: number;
};

enum ActionType {
    Stop,
    ChangeSpeed,
    Update,
}

type Action =
    | {
          type: ActionType.Stop;
      }
    | {
          type: ActionType.ChangeSpeed;
          amount: number;
      }
    | {
          type: ActionType.Update;
          timeDelta: number;
      };

function reduce(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.Stop:
            return { ...state, rotation: state.rotation, rotationSpeed: 0 };
        case ActionType.ChangeSpeed:
            return { ...state, rotationSpeed: state.rotationSpeed + action.amount };
        case ActionType.Update:
            return {
                ...state,
                rotation: state.rotation + state.rotationSpeed * action.timeDelta,
            };
        default:
            return state;
    }
}

function getFillColor(isDarkMode: boolean): string {
    return isDarkMode ? Colors.GRAY1 : Colors.GRAY5;
}

type WelcomeProps = {
    isVisible: boolean;
};

const Welcome: React.VoidFunctionComponent<WelcomeProps> = ({ isVisible }) => {
    const stateRef = useRef<State>({
        rotation: defaultRotation,
        rotationSpeed: 0,
    });
    const elementRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTernaryDarkMode();
    const fillColorRef = useRef('');
    // HACK: we don't want to image to flash when switching dark mode
    fillColorRef.current = getFillColor(isDarkMode);

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            // jsdom doesn't support ResizeObserver. don't really need to test animation anyway.
            return;
        }

        if (!isVisible) {
            return;
        }

        // istanbul ignore if: should not happen
        if (!elementRef.current) {
            console.error('elementRef was null!');
            return;
        }

        const two = new Two({ fitted: true }).appendTo(elementRef.current);

        const logo = two.load(logoSvg, (g) => {
            g.center();
            two.add(logo);
            two.play();
        });

        two.addEventListener('update', (_count, time: number) => {
            stateRef.current = reduce(stateRef.current, {
                type: ActionType.Update,
                timeDelta: time / 1000,
            });

            logo.fill = fillColorRef.current;
            logo.scale = Math.min(two.width, two.height) / 80;
            logo.rotation = stateRef.current.rotation;

            two.scene.position.x = two.width / 2;
            two.scene.position.y = two.height / 2;
        });

        const observer = new ResizeObserver(() => {
            two.fit();
        });

        observer.observe(elementRef.current);

        const handleClick = (e: Event) => {
            e.stopPropagation();
            e.preventDefault();

            stateRef.current = reduce(stateRef.current, {
                type: ActionType.Stop,
            });
        };

        two.renderer.domElement.addEventListener('pointerdown', handleClick, {
            capture: true,
        });

        const handleWheel = (e: Event) => {
            const we = e as WheelEvent;

            stateRef.current = reduce(stateRef.current, {
                type: ActionType.ChangeSpeed,
                amount: rotationSpeedIncrement * Math.sign(-we.deltaY),
            });
        };

        two.renderer.domElement.addEventListener('wheel', handleWheel, {
            passive: true,
        });

        // this animation is just for fun, screen readers don't need to know about it
        two.renderer.domElement.setAttribute('aria-hidden', 'true');

        return () => {
            two.renderer.domElement.removeEventListener('wheel', handleWheel);
            two.renderer.domElement.removeEventListener('pointerdown', handleClick);
            observer.disconnect();
            two.removeEventListener('update');
            elementRef.current?.removeChild(two.renderer.domElement);
            two.clear();
        };
    }, [isVisible]);

    return (
        <div
            className="pb-editor-welcome"
            ref={elementRef}
            onContextMenuCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        />
    );
};

export default Welcome;
