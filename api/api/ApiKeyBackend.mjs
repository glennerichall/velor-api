import {Api} from "./Api.mjs";

const kp_apiKey = Symbol("apiKey")

export class ApiKeyBackend extends Api {


    constructor(apiKey) {
        super();
        this[kp_apiKey] = apiKey;
    }

    getRequestBuilder(name, method) {
        return super.getRequestBuilder(name, method)
            .set('x-api-key', this[kp_apiKey]);
    }
}