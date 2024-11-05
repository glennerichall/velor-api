import {Api} from "./Api.mjs";

export class ApiKeyBackend extends Api {
    #apiKey;

    constructor(apiKey) {
        super();
        this.#apiKey = apiKey;
    }

    getRequestBuilder(name, method) {
        return super.getRequestBuilder(name, method)
            .set('x-api-key', this.#apiKey);
    }
}