import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

export const RequestBuilderProviderMixin = Parent => class extends Parent {

    getBuilder(...args) {
        throw new NotImplementedError();
    }

    get(urlOrName) {
        return this.getBuilder('get', urlOrName);
    }

    post(urlOrName) {
        return this.getBuilder('post', urlOrName);
    }

    put(urlOrName) {
        return this.getBuilder('put', urlOrName);
    }

    delete(urlOrName) {
        return this.getBuilder('delete', urlOrName);
    }

}