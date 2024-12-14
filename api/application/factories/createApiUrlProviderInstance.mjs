import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {ApiUrlProvider} from "../../api/ApiUrlProvider.mjs";
import {
    BACKEND_HOST_URL,
    BACKEND_VERSION_URLS
} from "../services/envKeys.mjs";

export function createApiUrlProviderInstance(services) {
    let host = getEnvValue(services, BACKEND_HOST_URL);
    let urls = getEnvValue(services, BACKEND_VERSION_URLS);
    return new ApiUrlProvider(host, urls);
}