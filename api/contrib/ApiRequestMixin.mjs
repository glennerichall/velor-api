import {identOp} from "velor-utils/utils/functional.mjs";
import {getServiceBinder} from "velor-utils/utils/injection/ServicesContext.mjs";
import {RequestBuilderBase} from "./RequestBuilderBase.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

export class ApiRequestBase extends RequestBuilderBase {
    #options;

    constructor(options = {}) {
        super();
        this.#options = options;
    }

    get options() {
        return this.#options;
    }

    withOptions(options = {}) {
        return getServiceBinder(this).clone(this, {
            ...this.#options,
            ...options
        });
    }

    request() {
        throw new NotImplementedError();
    }

    getUrl(urlOrName) {
        return urlOrName;
    }

    getBuilder(method, urlOrName, options = {}) {
        let url = this.getUrl(urlOrName);
        let effectiveOptions = {
            ...this.#options,
            ...options
        };
        return this.request(effectiveOptions)[method](url);
    }
}

export const ApiRequestMixin = (ApiRequestBase, request, getUrl = identOp) =>
    class extends ApiRequestBase {

        constructor(options = {}) {
            super(options);
        }

        request(options) {
            return request(this, options);
        }

        getUrl(urlOrName) {
            return getUrl(urlOrName);
        }
    }