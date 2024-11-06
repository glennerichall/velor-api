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
        return this.append(doNotThrowOnStatusRule(...status));
    }

    retry(n) {
        return this.append(retryRule(n));
    }

    append(rule) {
        this.#rule = chainRules(this.#rule, rule)
        return this;
    }
}