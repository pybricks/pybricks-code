import { all } from 'redux-saga/effects';
import bootloader from './bootloader';

export default function* (): Generator {
    yield all([bootloader()]);
}
