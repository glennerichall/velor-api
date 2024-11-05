import {takeInFlightResultRule} from "../request/rules.mjs";
import {retry} from "velor-utils/utils/functional.mjs";
import {unpackResponse} from "../request/unpackResponse.mjs";
import {getApi} from "../services/apiServices.mjs";
import {ruled} from "../request/RequestRuledTransmitter.mjs";


export class ApiUrlProvider {
    #backendUrl;
    #urls = null;

    constructor(backendUrl) {
        this.#backendUrl = backendUrl;
    }

    get versionUrl() {
        return `${this.#backendUrl}/api/version`;
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
            let response = await ruled(getApi(this).get(url), rule).send();
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