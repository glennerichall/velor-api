import {buildUrl} from "velor-utils/utils/urls.mjs";

const kp_url = Symbol("url");
const kp_params = Symbol("params");
const kp_query = Symbol("query");

export class UrlBuilder {

    constructor(url) {
        this[kp_url] = url;
        if (!this[kp_url]) {
            throw new Error("Url parameter missing");
        } 
        
        this[kp_query] = {};
        this[kp_params] = {};
    }

    getUrl() {
        return this[kp_url];
    }

    getQuery() {
        return this[kp_query];
    }

    getParams() {
        return this[kp_params];
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
                this[kp_query][key] = keyValues[key];
            }
            return this;
        }
        this[kp_query][key] = value;
        return this;
    }

    param(key, value) {
        if (typeof key === 'object') {
            let keyValues = key;
            for (let key in keyValues) {
                this[kp_params][key] = keyValues[key];
            }
            return this;
        }
        this[kp_params][key] = value;
        return this;
    }

    params(keyValues) {
        for (let key in keyValues) {
            this[kp_params][key] = keyValues[key];
        }
        return this;
    }

}