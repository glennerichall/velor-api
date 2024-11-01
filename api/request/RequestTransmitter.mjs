import {getRequestInvoker} from "../services/apiServices.mjs";
import {RequestBuilder} from "./RequestBuilder.mjs";

export class RequestTransmitter extends RequestBuilder {

    constructor(method, url) {
        super(method, url);
    }

    async send(data) {
        this.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            this.setContent(data);
        }
        let request = this.getRequest();
        return getRequestInvoker(this).send(request);
    }
}