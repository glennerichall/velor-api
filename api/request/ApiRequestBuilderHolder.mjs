import {RequestBuilderProviderMixin} from "./RequestBuilderProviderMixin.mjs";
import {ApiRequestHolder} from "./ApiRequestHolder.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {bindReplaceResult} from "velor-utils/utils/proxy.mjs";
import {unpackResponse} from "./unpackResponse.mjs";

export class ApiRequestBuilderHolder extends RequestBuilderProviderMixin(ApiRequestHolder) {
    #store;

    constructor(store) {
        super();
        this.#store = store;
    }

    clone() {
        return new this.constructor(this.#store);
    }

    getBuilder(method, nameOrUrl) {
        let rule = this.rule;
        let options = this.options ?? {};
        let key = this.key;

        let api = requestWithRule(this, rule, options);
        let builder = api[method](nameOrUrl);

        if (key) {
            bindReplaceResult(builder, 'getRequest', request => {
                request.name = key;
                return request;
            });
            bindReplaceResult(builder, 'send', async response => {
                let body = await unpackResponse(response);
                this.#store.setState(key, body);
                return response;
            });
        }

        return builder;
    }
}