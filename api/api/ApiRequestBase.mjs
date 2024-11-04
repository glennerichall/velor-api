import {getServiceBinder} from "velor-utils/utils/injection/ServicesContext.mjs";
import {
    getApi,
    getRequestTransmitter
} from "../services/apiServices.mjs";
import {forwardMethods} from "velor-utils/utils/proxy.mjs";
import {RequestTransmitter} from "../request/RequestTransmitter.mjs";

export class ApiRequestBase {
    #options;
    #listener;

    constructor(options = {}) {
        this.#options = options;
    }

    get api() {
        return getApi(this);
    }

    get options() {
        return this.#options;
    }

    setListener(listener) {
        this.#listener = listener;
    }

    withOptions(options = {}) {
        return getServiceBinder(this).clone(this, {
            ...this.options,
            ...options
        });
    }

    onCreateBuilder(listener) {
        let clone = getServiceBinder(this).clone(this, {...this.options});
        clone.setListener(listener);
        return clone;
    }

    prepareRequestBuilder(builder) {
        builder.options(this.options);
        let transmitter = getRequestTransmitter(this);
        forwardMethods(transmitter, builder);
        if (this.#listener) {
            this.#listener(builder);
        }
        return builder;
    }

    get(...args) {
        return this.prepareRequestBuilder(
            this.api.get(...args)
        );
    }

    post(...args) {
        return this.prepareRequestBuilder(
            this.api.post(...args)
        );
    }

    delete(...args) {
        return this.prepareRequestBuilder(
            this.api.delete(...args)
        );
    }

    put(...args) {
        return this.prepareRequestBuilder(
            this.api.put(...args)
        );
    }
}