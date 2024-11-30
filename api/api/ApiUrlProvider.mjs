import {takeInFlightResultRule} from "../ops/rules.mjs";
import {retry} from "velor-utils/utils/functional.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {unpackResponse} from "../ops/unpackResponse.mjs";

export class ApiUrlProvider {
    #backendUrl;
    #versionPath;
    #urls = null;

    constructor(backendUrl, versionPath = '/api/version') {
        this.#backendUrl = backendUrl;
        this.#versionPath = versionPath;
    }

    get versionUrl() {
        return `${this.#backendUrl}${this.#versionPath}`;
    }

    get urls() {
        return this.#urls;
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
            let response = await requestWithRule(this, rule).get(url).send();

            if (response) {
                let version = await unpackResponse(response);
                this.#urls = version.api.urls;
            }
            return this.#urls;
        });
    }

    getUrl(name) {
        return this.#urls[name];
    }

    clear() {
        this.#urls = null;
    }

}