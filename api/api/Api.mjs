import {getRequestBuilder} from "../services/apiServices.mjs";
import {RequestBuilderProvider} from "../contrib/RequestBuilderProviderMixin.mjs";

export class Api extends RequestBuilderProvider {

    getRequestBuilder(urlOrName, method) {
        return getRequestBuilder(this, method, urlOrName);
    }

    getBuilder(method, urlOrName) {
        return this.getRequestBuilder(urlOrName, method.toUpperCase());
    }
}