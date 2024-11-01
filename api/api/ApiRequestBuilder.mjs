import {RequestBuilder} from "../request/RequestBuilder.mjs";
import {ApiUrlProviderMixin} from "./ApiUrlProviderMixin.mjs";

export class ApiRequestBuilder extends ApiUrlProviderMixin(RequestBuilder) {

    constructor(...args) {
        super(...args);
    }

    getRequest() {
        let controller = this.getController();
        return {
            abort: () => controller.abort(),
            name: this.getUrl(),
            url: this.buildUrl(),
            options: this.buildOptions()
        };
    }

}