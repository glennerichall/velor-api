import {ResponseWrapper} from "./ResponseWrapper.mjs";
import {getDataFromXhrResponse} from "./getDataFromXhrResponse.mjs";
import {MessageWrapper} from "velor-messaging/messaging/message/MessageWrapper.mjs";

export async function getDataFromResponse(response) {
    response = await response;

    if (response instanceof ResponseWrapper) {
        return response.unpack();
    } else if (response instanceof Response || response?.isHTTPResponse) {
        return getDataFromXhrResponse(response);
    } else if (response instanceof MessageWrapper) {
        return response.getData();
    } else if (response?.body) {
        return response.body;
    }
    return response;
}