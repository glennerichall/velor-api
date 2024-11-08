import {
    getApi,
    getApiBuilder,
    getApiUrlProvider,
    getFetch,
    getRequestBuilder,
    getRequestInvoker,
    getRequestRegulator,
    getRequestTracker,
    getRequestTransmitter
} from "./apiServices.mjs";
import {getDataFromResponse} from "../ops/getDataFromResponse.mjs";
import {getDataFromXhrResponse} from "../ops/getDataFromXhrResponse.mjs";
import {unpackResponse} from "../ops/unpackResponse.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {request} from "../composers/request.mjs";

export function getApiServicesProvider(policy = {}) {
    return {
        getFetch,
        getRequestInvoker,
        getRequestTracker,
        getApi,
        getRequestRegulator,
        getRequestBuilder,
        getRequestTransmitter,
        getApiBuilder,
        getApiUrlProvider,
        ...policy
    };
}

export function getApiOpsProvider(policy) {
    return {
        getDataFromResponse,
        getDataFromXhrResponse,
        unpackResponse,
        requestWithRule,
        request,
        ...policy
    };
}