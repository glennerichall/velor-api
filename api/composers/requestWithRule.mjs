import {
    getApi,
    getRequestInvoker,
    getRequestRegulator
} from "../services/apiServices.mjs";
import {
    createApiRequester,
} from "./createApiRequester.mjs";
import {createProxyReplaceResult} from "velor-utils/utils/proxy.mjs";

export function composeRequester(api, urlProvider, options) {
    let requester = createApiRequester(api, invokerAdapter, options);
    createProxyReplaceResult(requester, builder => {

    });
}

export function requestWithRule(services, rule, options) {
    let invoker = getRequestInvoker(services);
    let api = getApi(services);

    let regulator = getRequestRegulator(services);
    let invokerAdapter = {
        send(request) {
            return regulator.accept(request, invoker, rule);
        }
    };
    return createApiRequester(api, invokerAdapter, options);
}