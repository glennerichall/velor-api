import {getRequestInvoker} from "../services/apiServices.mjs";

export class RequestTransmitter {
    #builder;

    constructor(builder) {
        this.#builder = builder;
    }

    async send(data) {
        this.#builder.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            this.#builder.setContent(data);
        }
        let request = this.#builder.getRequest();
        return getRequestInvoker(this).send(request);
    }
}