import {takeInFlightResultRule} from "../ops/rules.mjs";
import {retry} from "velor-utils/utils/functional.mjs";
import {getApiOpsProvider} from "../services/apiPolicies.mjs";


export const ApiUrlProviderPolicy = policy => {

    const {
        requestWithRule,
        unpackResponse
    } = getApiOpsProvider(policy);

    return class ApiUrlProvider {
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
}

export const ApiUrlProvider = ApiUrlProviderPolicy();