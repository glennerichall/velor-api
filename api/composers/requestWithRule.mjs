import {
    getApi,
    getRequestInvoker,
    getRequestRegulator
} from "../services/apiServices.mjs";
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