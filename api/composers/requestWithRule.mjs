import {
    getApi,
    getRequestInvoker,
    getRequestRegulator
} from "../application/services/services.mjs";
import {
    createApiWithSendMethod,
} from "./createApiWithSendMethod.mjs";

export function requestWithRule(services, rule, options) {
    let invoker = getRequestInvoker(services);
    let api = getApi(services);

    let regulator = getRequestRegulator(services);
    let invokerAdapter = {
        send(request) {
            return regulator.accept(request, invoker, rule);
        }
    };
    return createApiWithSendMethod(api, invokerAdapter, options);
}