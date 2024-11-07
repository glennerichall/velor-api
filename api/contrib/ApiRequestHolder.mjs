import {RuleBuilder} from "../request/RuleBuilder.mjs";

export class ApiRequestHolder {
    #options;
    #ruleBuilder = new RuleBuilder();
    #key;

    get key() {
        return this.#key;
    }

    get options() {
        return this.#options;
    }

    get rule() {
        return this.#ruleBuilder.build();
    }

    withOptions(options = {}) {
        this.#options = {
            ...this.#options, ...options
        };
        return this;
    }

    withRule(rule) {
        this.#ruleBuilder.append(rule);
        return this;
    }

    saveTo(key) {
        this.#key = key;
        return this;
    }

    copy(holder) {
        this.#key = holder.key;
        this.#ruleBuilder.append(holder.rule);
        this.#key = {...holder.options};
    }

    clone() {
        const holder = new this.constructor();
        holder.copy(this);
        return holder;
    }
}