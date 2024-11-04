import {getRequestInvoker} from "../services/apiServices.mjs";

export class RequestTransmitter {
    #builder;

    constructor(builder) {
        this.#builder = builder;
    }

    async sendRequest(request, invoker) {
        return invoker.send(request);
    }

    async send(data) {
        this.#builder.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            this.#builder.setContent(data);
        }
        let request = this.#builder.getRequest();
        let invoker = getRequestInvoker(this);
        return this.sendRequest(request, invoker);
    }
}