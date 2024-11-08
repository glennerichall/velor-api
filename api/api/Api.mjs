import {RequestBuilderProvider} from "../contrib/RequestBuilderProviderMixin.mjs";

import {getApiServicesProvider} from "../services/apiPolicies.mjs";


export const ApiPolicy = policy => {

    const {
        getRequestBuilder
    } = getApiServicesProvider(policy);

    return class Api extends RequestBuilderProvider {

        getRequestBuilder(urlOrName, method) {
            return getRequestBuilder(this, method, urlOrName);
        }

        getBuilder(method, urlOrName) {
            return this.getRequestBuilder(urlOrName, method.toUpperCase());
        }
    }
}

export const Api = ApiPolicy();