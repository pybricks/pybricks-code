import { AnyAction } from 'redux';
import { didBooleanChange, didStringChange } from './actions';
import { BooleanSettingId, StringSettingId } from './defaults';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "darkMode": false,
          "flashCurrentProgram": false,
          "hubName": "",
          "isHubNameValid": true,
          "showDocs": true,
        }
    `);
});

describe('darkMode', () => {
    test('setting changed', () => {
        expect(
            reducers(
                { darkMode: false } as State,
                didBooleanChange(BooleanSettingId.DarkMode, true),
            ).darkMode,
        ).toBe(true);
    });
});

describe('showDocs', () => {
    test('setting changed', () => {
        expect(
            reducers(
                { showDocs: false } as State,
                didBooleanChange(BooleanSettingId.ShowDocs, true),
            ).showDocs,
        ).toBe(true);
    });
});

describe('flashCurrentProgram', () => {
    test('setting changed', () => {
        expect(
            reducers(
                { flashCurrentProgram: false } as State,
                didBooleanChange(BooleanSettingId.FlashCurrentProgram, true),
            ).flashCurrentProgram,
        ).toBe(true);
    });
});

describe('hubName', () => {
    const testName = 'test name';
    test('setting changed', () => {
        expect(
            reducers(
                { hubName: '' } as State,
                didStringChange(StringSettingId.HubName, testName),
            ).hubName,
        ).toBe(testName);
    });
});

describe('isHubNameValid', () => {
    test('default name is ok', () => {
        expect(
            reducers(
                undefined,
                didStringChange(StringSettingId.HubName, 'Pybricks Hub'),
            ).isHubNameValid,
        ).toBe(true);
    });

    test('empty name is ok', () => {
        expect(
            reducers(undefined, didStringChange(StringSettingId.HubName, ''))
                .isHubNameValid,
        ).toBe(true);
    });

    test('too long name fails', () => {
        expect(
            reducers(
                undefined,
                didStringChange(StringSettingId.HubName, 'this name is way too long'),
            ).isHubNameValid,
        ).toBe(false);
    });

    test('the number of bytes matter, not the number of characters', () => {
        expect(
            reducers(
                undefined,
                // Chinese characters are 3 bytes each.
                didStringChange(StringSettingId.HubName, 'Pybricks 枢纽!'),
            ).isHubNameValid,
        ).toBe(false);
    });
});
