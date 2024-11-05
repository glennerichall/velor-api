import {getRequestBuilder} from "../services/apiServices.mjs";

export class Api {

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
}