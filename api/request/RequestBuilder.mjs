import {UrlBuilder} from "./UrlBuilder.mjs";
import {isTypedArray} from "velor-utils/utils/buffer/isTypedArray.mjs";
import {getFetch} from "../application/services/apiServices.mjs";

export class RequestBuilder extends UrlBuilder {
    #method;
    #body;
    #headers;
    #options = {};
    // FIXME should be provided by Fetch class
    #controller = new AbortController();
    #canAbort = true;

    constructor(method, url) {
        super(url);
        this.#method = method;
    }

    set(name, value) {
        if (!this.#headers) {
            this.#headers = getFetch(this).createHeaders();
        }
        this.#headers.append(name, value);
        return this;
    }

    option(key, value) {
        this.#options[key] = value;
        return this;
    }

    options(keyValues) {
        for (let key in keyValues) {
            this.#options[key] = keyValues[key];
        }
        return this;
    }

    noAbort() {
        this.#canAbort = false;
        return this;
    }

    setContent(data) {
        if (isTypedArray(data) || data instanceof ArrayBuffer) {
            this.set('Content-Type', 'application/octet-stream');
        } else if (data && typeof data === 'object' && !(data instanceof URLSearchParams)) {
            data = JSON.stringify(data);
            this.set('Content-Type', 'application/json');
        }
        this.#body = data;
        return this;
    }

    buildOptions() {
        let signal;
        if (this.#canAbort) {
            signal = this.#controller.signal;
        }

        return {
            ...this.#options,
            method: this.#method,
            headers: this.#headers,
            body: this.#body,
            credentials: 'include',
            mode: 'cors',
            signal
        };
    }

    getController() {
        return this.#controller;
    }

    getRequest() {
        return {
            abort: () => this.#controller.abort(),
            url: this.buildUrl(),
            options: this.buildOptions()
        };
    }
}