import {getRequestRegulator} from "../services/apiServices.mjs";
import {
    alwaysSendRule,
    chainRules,
    doNotThrowOnStatusRule,
    retryRule
} from "./rules.mjs";

export function ruled(builder, rule) {
    return bindCaptureCall(builder, 'send', async (target, data) => {
        return await getRequestRegulator(builder).accept(request, invoker, this.#rule);
    });
}

export class RuleBuilder {
    #rule = alwaysSendRule;

    build() {
        return this.#rule;
    }

    doNotFailFor(...status) {
        this.#rule = chainRules(this.#rule, doNotThrowOnStatusRule(...status))
        return this;
    }

    retry(n) {
        this.#rule = chainRules(this.#rule, retryRule(n))
        return this;
    }
}

export class RequestRuledTransmitter {
    #rule;

    async send(request, invoker) {
        return await getRequestRegulator(this).accept(request, invoker, this.#rule);
    }
}