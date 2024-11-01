import {ApiRequestBuilder} from "../api/ApiRequestBuilder.mjs";
import {
    getRequestRegulator
} from "../services/apiServices.mjs";
import {
    alwaysSendRule,
    chainRules,
    doNotThrowOnStatusRule,
    retryRule
} from "./rules.mjs";
import {noOp} from "velor-utils/utils/functional.mjs";

export class RequestRuledTransmitter extends ApiRequestBuilder {
    #rule = alwaysSendRule;
    #listener;

    constructor(method, url) {
        super(method, url);
    }

    onResponse(listener) {
        this.#listener = listener;
        return this;
    }

    rule(rule) {
        this.#rule = rule;
        return this;
    }

    doNotFailFor(...status) {
        this.#rule = chainRules(this.#rule, doNotThrowOnStatusRule(...status))
        return this;
    }

    retry(n) {
        this.#rule = chainRules(this.#rule, retryRule(n))
        return this;
    }

    async send(data) {
        this.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            this.setContent(data);
        }
        let request = this.getRequest();
        let response = getRequestRegulator(this).accept(request, this.#rule);
        if (this.#listener) {
            this.#listener(response).catch(noOp);
        }
        return response;
    }
}