import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {ApiUrlProvider} from "../../api/ApiUrlProvider.mjs";
import {
    BACKEND_HOST_URL,
    BACKEND_VERSION_URLS
} from "../services/apiEnvKeys.mjs";

export function createApiUrlProviderInstance(services) {
    let host = getEnvValue(services, BACKEND_HOST_URL);
    let urls = getEnvValue(services, BACKEND_VERSION_URLS);
    return new ApiUrlProvider(host, urls);
}