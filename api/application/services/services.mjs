import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {
    s_api,
    s_apiBuilder,
    s_fetch,
    s_requestBuilder,
    s_requestInvoker,
    s_requestNamingStrategy,
    s_requestRegulator,
    s_requestStore,
    s_requestTracker,
    s_requestTransmitter,
    s_urlProvider
} from "./serviceKeys.mjs";

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

export function getRequestTransmitter(services, ...args) {
    return getProvider(services)[s_requestTransmitter](...args);
}

export function getApiBuilder(services) {
    return getProvider(services)[s_apiBuilder]();
}

export function getApiUrlProvider(services) {
    return getProvider(services)[s_urlProvider]();
}

export function getRequestStore(services) {
    return getProvider(services)[s_requestStore]();
}

export function getRequestNamingStrategy(services) {
    return getProvider(services)[s_requestNamingStrategy]();
}