import {buildUrl} from "velor-utils/utils/urls.mjs";

export class UrlBuilder {
    #url;
    #query = {};
    #params = {};

    constructor(url) {
        this.#url = url;
        if (!this.#url) {
            throw new Error("Url parameter missing");
        }
    }

    getUrl() {
        return this.#url;
    }

    getQuery() {
        return this.#query;
    }

    getParams() {
        return this.#params;
    }

    buildUrl() {
        return buildUrl(
            this.getUrl(),
            this.getParams(),
            this.getQuery()
        );
    }

    query(key, value) {
        if (typeof key === 'object') {
            let keyValues = key;
            for (let key in keyValues) {
                this.#query[key] = keyValues[key];
            }
            return this;
        }
        this.#query[key] = value;
        return this;
    }

    param(key, value) {
        if (typeof key === 'object') {
            let keyValues = key;
            for (let key in keyValues) {
                this.#params[key] = keyValues[key];
            }
            return this;
        }
        this.#params[key] = value;
        return this;
    }

    params(keyValues) {
        for (let key in keyValues) {
            this.#params[key] = keyValues[key];
        }
        return this;
    }

}