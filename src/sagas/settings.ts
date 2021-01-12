import { put, select, takeEvery } from 'redux-saga/effects';
import { AppActionType } from '../actions/app';
import { SettingsActionType, toggleDarkMode } from '../actions/settings';
import { RootState } from '../reducers';
import { SettingsState } from '../reducers/settings';

function* loadSettings(): Generator {
    const settingsString = localStorage.getItem('settings');
    if (!settingsString) {
        return;
    }
    const settings = JSON.parse(settingsString) as SettingsState;

    // TODO: there has to be a better way to initialize app state from settings
    if (settings.darkMode) {
        yield put(toggleDarkMode());
    }
}

function* saveSettings(): Generator {
    const settings = (yield select((s: RootState) => s.settings)) as SettingsState;
    localStorage.setItem('settings', JSON.stringify(settings));
}

function* updateDarkModeClass(): Generator {
    const darkMode = (yield select((s: RootState) => s.settings.darkMode)) as boolean;
    if (darkMode) {
        document.body.classList.add('bp3-dark');
    } else {
        document.body.classList.remove('bp3-dark');
    }
}

export default function* (): Generator {
    yield takeEvery(AppActionType.Startup, loadSettings);
    yield takeEvery(Object.values(SettingsActionType), saveSettings);
    yield takeEvery(SettingsActionType.ToggleDarkMode, updateDarkModeClass);
}
