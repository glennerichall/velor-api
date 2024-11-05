import {getApi, getRequestInvoker} from "../services/apiServices.mjs";
import {createApiRequester} from "./createApiRequester.mjs";

export function request(services, options) {
    let invoker = getRequestInvoker(services);
    let api = getApi(services);
    return createApiRequester(api, invoker, options);
}