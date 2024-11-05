import {retry} from "velor-utils/utils/functional.mjs";
import {ApiRequesterBase} from "./api/ApiRequesterBase.mjs";

export class UrlApi extends ApiRequesterBase {
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