import {getDataFromResponse} from "./getDataFromResponse.mjs";

export async function unpackResponse(response) {
    return getDataFromResponse(response);
}