import {RequestBuilderProvider} from "../contrib/RequestBuilderProviderMixin.mjs";
import {getRequestBuilder} from "../services/apiServices.mjs";

export class Api extends RequestBuilderProvider {

    getRequestBuilder(urlOrName, method) {
        return getRequestBuilder(this, method, urlOrName);
    }

    getBuilder(method, urlOrName) {
        return this.getRequestBuilder(urlOrName, method.toUpperCase());
    }
}