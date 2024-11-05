import {getApi, getRequestInvoker} from "../services/apiServices.mjs";
import {createApiWithSendMethod} from "./createApiWithSendMethod.mjs";

export function request(services, options) {
    let invoker = getRequestInvoker(services);
    let api = getApi(services);
    return createApiWithSendMethod(api, invoker, options);
}