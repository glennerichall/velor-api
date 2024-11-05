import {RequestBuilderBase} from "./RequestBuilderBase.mjs";

class OptionHolder extends RequestBuilderBase {
    #options;
    #apiRequest;

    constructor(options, apiRequest) {
        super();
        this.#options = options;
        this.#apiRequest = apiRequest;
    }

    getBuilder(method, urlOrName) {
        return this.#apiRequest.getBuilder(method, urlOrName, this.#options)
    }

}