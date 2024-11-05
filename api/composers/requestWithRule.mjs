import {getApi, getRequestInvoker, getRequestRegulator} from "../services/apiServices.mjs";
import {createApiRequesterWithRule} from "./createApiRequester.mjs";

export function requestWithRule(services, rule, options) {
    let regulator = getRequestRegulator(services);
    let invoker = getRequestInvoker(services);
    let api = getApi(services);
    return createApiRequesterWithRule(api, invoker, regulator, rule, options);
}