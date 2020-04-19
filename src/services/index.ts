import { Action, Dispatch, Middleware } from 'redux';
import bootloader from './bootloader';

type Service = (action: Action, dispatch: Dispatch) => Promise<void>;

function runService(service: Service, action: Action, dispatch: Dispatch): void {
    service(action, dispatch).catch((err) =>
        console.log(`Unhandled exception in service: ${err}`),
    );
}

export function combineServices(...services: Service[]): Service {
    return (a, d): Promise<void> => {
        services.forEach((s) => runService(s, a, d));
        return Promise.resolve();
    };
}

const rootService = combineServices(bootloader);

const serviceMiddleware: Middleware = (store) => (next) => (action): unknown => {
    runService(rootService, action, store.dispatch);
    return next(action);
};

export default serviceMiddleware;
