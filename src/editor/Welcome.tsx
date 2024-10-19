// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

// welcome screen that is shown when no editor is open.

import { Button, Colors } from '@blueprintjs/core';
import { DocumentOpen, Plus } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Two from 'two.js';
import { useTernaryDarkMode } from 'usehooks-ts';
import { Activity, useActivitiesSelectedActivity } from '../activities/hooks';
import { recentFileCount } from '../app/constants';
import { explorerCreateNewFile } from '../explorer/actions';
import { UUID } from '../fileStorage';
import { useSelector } from '../reducers';
import { editorActivateFile } from './actions';
import { useI18n } from './i18n';
import logoSvg from './logo.svg';
import { RecentFileMetadata } from '.';

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

const Welcome: React.FunctionComponent<WelcomeProps> = ({ isVisible }) => {
    const i18n = useI18n();
    const dispatch = useDispatch();
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

        const element = elementRef.current;

        // istanbul ignore if: should not happen
        if (!element) {
            console.error('elementRef.current was null!');
            return;
        }

        const two = new Two({ fitted: true }).appendTo(element);

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

        observer.observe(element);

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
            element.removeChild(two.renderer.domElement);
            two.clear();
        };
    }, [isVisible]);

    const [, setSelectedActivity] = useActivitiesSelectedActivity();
    const handleOpenNewProject = useCallback(() => {
        setSelectedActivity(Activity.Explorer);
        dispatch(explorerCreateNewFile());
    }, [dispatch, setSelectedActivity]);

    const handleOpenExplorer = useCallback(
        (uuid: UUID) => {
            setSelectedActivity(Activity.Explorer);
            dispatch(editorActivateFile(uuid));
        },
        [dispatch, setSelectedActivity],
    );

    const recentFiles: readonly RecentFileMetadata[] = useSelector(
        (s) => s.editor.recentFiles,
    );
    // NOTE: could use UUID instead of storing - const uuid = useFileStorageUuid(file ?? '');

    const getRecentFileShortCuts = () => (
        <>
            {recentFiles.slice(0, recentFileCount).map((fitem: RecentFileMetadata) => (
                <dl key={fitem.uuid} onClick={() => handleOpenExplorer(fitem.uuid)}>
                    <dt>
                        {i18n.translate('welcome.openProject', {
                            fileName: fitem.path,
                        })}
                    </dt>
                    <dd>
                        <Button
                            icon={<DocumentOpen />}
                            onClick={() => handleOpenExplorer(fitem.uuid)}
                        />
                    </dd>
                </dl>
            ))}
        </>
    );

    return (
        <div
            className="pb-editor-welcome"
            onContextMenuCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div className="logo" ref={elementRef}></div>
            <div className="shortcuts">
                {getRecentFileShortCuts()}
                <dl>
                    <dt>{i18n.translate('welcome.newProject')}</dt>
                    <dd>
                        <Button icon={<Plus />} onClick={handleOpenNewProject} />
                    </dd>
                </dl>
            </div>
        </div>
    );
};

export default Welcome;
