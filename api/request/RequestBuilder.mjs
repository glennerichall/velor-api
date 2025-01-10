import {UrlBuilder} from "./UrlBuilder.mjs";
import {isTypedArray} from "velor-utils/utils/buffer/isTypedArray.mjs";

const kp_method = Symbol("method");
const kp_body = Symbol("body");
const kp_headers = Symbol("headers");
const kp_options = Symbol("options");
const kp_controller = Symbol("controller");
const kp_canAbort = Symbol("canAbort");

export class RequestBuilder extends UrlBuilder {


    constructor(method, url) {
        super(url);
        this[kp_method] = method;
        this[kp_headers] = new Map();
        this[kp_options] = {};
        // FIXME should be abstract
        this[kp_controller] = new AbortController();
        this[kp_canAbort] = true;
    }

    set(name, value) {
        this[kp_headers].set(name, value);
        return this;
    }

    option(key, value) {
        this[kp_options][key] = value;
        return this;
    }

    options(keyValues) {
        for (let key in keyValues) {
            this[kp_options][key] = keyValues[key];
        }
        return this;
    }

    noAbort() {
        this[kp_canAbort] = false;
        return this;
    }

    setContent(data) {
        if (isTypedArray(data) || data instanceof ArrayBuffer) {
            this.set('Content-Type', 'application/octet-stream');
        } else if (data && typeof data === 'object' && !(data instanceof URLSearchParams)) {
            data = JSON.stringify(data);
            this.set('Content-Type', 'application/json');
        }
        this[kp_body] = data;
        return this;
    }

    buildOptions() {
        let signal;
        if (this[kp_canAbort]) {
            signal = this[kp_controller].signal;
        }

        return {
            ...this[kp_options],
            method: this[kp_method],
            headers: this[kp_headers],
            body: this[kp_body],
            credentials: 'include',
            mode: 'cors',
            signal
        };
    }

    getController() {
        return this[kp_controller];
    }

    getRequest() {
        return {
            abort: () => this[kp_controller].abort(),
            url: this.buildUrl(),
            options: this.buildOptions()
        };
    }
}