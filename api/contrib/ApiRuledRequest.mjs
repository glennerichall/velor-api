import {
    ApiRequestBase
} from "./ApiRequestMixin.mjs";
import {alwaysSendRule} from "../request/rules.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";

export class ApiRuledRequest extends ApiRequestBase {
    #rule = alwaysSendRule;

    constructor(...args) {
        super(...args);
    }

    rule(rule) {
        this.#rule = rule;
        return this;
    }

    request(options) {
        return requestWithRule(this, this.#rule, options);
    }
}