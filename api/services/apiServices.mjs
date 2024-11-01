import {getProvider} from "velor-utils/utils/injection/baseServices.mjs";
import {
    s_api,
    s_fetch,
    s_requestBuilder,
    s_requestInvoker,
    s_requestRegulator,
    s_requestTracker
} from "./apiServiceKeys.mjs";

export function getFetch(services) {
    return getProvider(services)[s_fetch]();
}

export function getRequestInvoker(services) {
    return getProvider(services)[s_requestInvoker]();
}

export function getRequestTracker(services) {
    return getProvider(services)[s_requestTracker]();
}

export function getApi(services) {
    return getProvider(services)[s_api]();
}

export function getRequestRegulator(services) {
    return getProvider(services)[s_requestRegulator]();
}

export function getRequestBuilder(services, ...args) {
    return getProvider(services)[s_requestBuilder](...args);
}