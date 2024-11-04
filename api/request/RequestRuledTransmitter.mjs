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
import {RequestTransmitter} from "./RequestTransmitter.mjs";

export class RequestRuledTransmitter extends RequestTransmitter {
    #rule = alwaysSendRule;
    #onResponse;

    constructor(builder) {
        super(builder);
    }

    onResponse(listener) {
        this.#onResponse = listener;
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

    async sendRequest(request, invoker) {
        let response = await getRequestRegulator(this).accept(request, invoker, this.#rule);
        if (this.#onResponse) {
            this.#onResponse(response).catch(noOp);
        }
        return response;
    }
}