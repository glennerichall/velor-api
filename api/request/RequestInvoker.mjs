import typeis from "type-is";
import {
    ResponseWrapper,
} from "./ResponseWrapper.mjs";
import {BackendError} from "../BackendError.mjs";
import {getFetch} from "../services/apiServices.mjs";

export class RequestInvoker {

    async validateResponse(request, response) {
        const {
            url
        } = request;

        if (response && !response.ok && !response.redirect) {
            const contentType = response.headers.get('content-type') ?? "";
            let error;
            if (typeis.match('text/*', contentType)) {
                error = await response.text();
            } else if (typeis.match('*/json', contentType)) {
                error = await response.json();
            }
            throw new BackendError(response.status, error, url);
        }

        return response;
    }

    async send(request) {
        const {
            url,
            options
        } = request;
        let response;

        let fetch = getFetch(this);

        try {
            let promise = fetch.send(url, options);
            request.promise = promise;
            response = await promise;
        } catch (e) {
            throw new BackendError(0, e.message, request);
        }

        response = await this.validateResponse(request, response);
        return new ResponseWrapper(response);
    }
}