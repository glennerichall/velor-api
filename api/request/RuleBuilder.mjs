import {
    alwaysSendRule,
    chainRules,
    doNotThrowOnStatusRule,
    retryRule
} from "./rules.mjs";


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