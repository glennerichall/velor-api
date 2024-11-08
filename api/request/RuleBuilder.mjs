import {
    alwaysSendRule,
    chainRules,
    doNotThrowOnStatusRule,
    retryRule
} from "../ops/rules.mjs";

export const PolicyBasedRuleBuilder = (
    defaultRule,
    doNotThrowOnStatusRule,
    retryRule,
    chainRules
) => class {
    #rule = null;

    build() {
        return this.#rule ?? defaultRule;
    }

    doNotFailFor(...status) {
        return this.append(doNotThrowOnStatusRule(...status));
    }

    retry(n) {
        return this.append(retryRule(n));
    }

    append(rule) {
        if (this.#rule && rule) {
            this.#rule = chainRules(this.#rule, rule)
        } else {
            this.#rule = rule;
        }
        return this;
    }
}

export const RuleBuilder = PolicyBasedRuleBuilder(
    alwaysSendRule,
    doNotThrowOnStatusRule,
    retryRule,
    chainRules
);