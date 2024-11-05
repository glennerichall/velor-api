import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

export class RequestBuilderBase {

    getBuilder(...args) {
        throw new NotImplementedError();
    }

    get(urlOrName) {
        this.getBuilder('get', urlOrName);
    }

    post(urlOrName) {
        this.getBuilder('post', urlOrName);
    }

    put(urlOrName) {
        this.getBuilder('put', urlOrName);
    }

    delete(urlOrName) {
        this.getBuilder('delete', urlOrName);
    }
}