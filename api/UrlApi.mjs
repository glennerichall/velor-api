import {retry} from "velor-utils/utils/functional.mjs";
import {ApiRequestBase} from "./api/ApiRequestBase.mjs";

export class UrlApi extends ApiRequestBase {
    #apiDescriptionUrl;

    constructor(apiDescriptionUrl) {
        super();
        this.#apiDescriptionUrl = apiDescriptionUrl;
    }

    async getUrls(rules) {
        return retry(async () => {
            return this.get(this.#apiDescriptionUrl)
                .rule(rules)
                .send();
        });
    }
}