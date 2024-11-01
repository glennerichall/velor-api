import {retry} from "velor-utils/utils/functional.mjs";
import {takeInFlightResultRule} from "../request/rules.mjs";
import {getRequestBuilder} from "../services/apiServices.mjs";
import {unpackResponse} from "../request/unpackResponse.mjs";

export class Api {
    #backendUrl;
    #urls = null;

    constructor(backendUrl) {
        this.#backendUrl = backendUrl;
    }

    get urls() {
        return this.#urls;
    }

    get versionUrl() {
        return `${this.#backendUrl}/api/version`;
    }

    getRequestBuilder(urlOrName, method) {
        return getRequestBuilder(this, method, urlOrName);
    }

    get(urlOrName) {
        return this.getRequestBuilder(urlOrName, 'GET');
    }

    post(urlOrName) {
        return this.getRequestBuilder(urlOrName, 'POST');
    }

    put(urlOrName) {
        return this.getRequestBuilder(urlOrName, 'PUT');
    }

    delete(urlOrName) {
        return this.getRequestBuilder(urlOrName, 'DELETE');
    }

    getUrls() {
        return this.urls;
    }

    async getOrFetchUrls() {
        if (!this.urls) {
            await this.fetchUrls();
        }
        return this.urls;
    }

    async fetchUrls(rule = takeInFlightResultRule) {
        return retry(async () => {
            let url = this.versionUrl;
            let response = await this.get(url).rule(rule).send();
            if (response) {
                let version = await unpackResponse(response);
                this.#urls = version.api.urls;
            }
            return this.#urls;
        });
    }

    clear() {
        this.#urls = null;
    }
}