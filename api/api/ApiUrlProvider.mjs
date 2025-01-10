import {takeInFlightResultRule} from "../ops/rules.mjs";
import {retry} from "velor-utils/utils/functional.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {unpackResponse} from "../ops/unpackResponse.mjs";

const kp_backendUrl = Symbol("backendUrl");
const kp_versionPath = Symbol("versionPath");
const kp_urls = Symbol("urls");

export class ApiUrlProvider {


    constructor(backendUrl, versionPath = '/api/version') {
        this[kp_backendUrl] = backendUrl;
        this[kp_versionPath] = versionPath;
        this[kp_urls] = null;
    }

    get versionUrl() {
        return `${this[kp_backendUrl]}${this[kp_versionPath]}`;
    }

    get urls() {
        return this[kp_urls];
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
                this[kp_urls] = version.api.urls;
            }
            return this[kp_urls];
        });
    }

    getUrl(name) {
        return this[kp_urls][name];
    }

    clear() {
        this[kp_urls] = null;
    }

}