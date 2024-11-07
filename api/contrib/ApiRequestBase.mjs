import {ApiRequestBuilderHolder} from "./ApiRequestBuilderHolder.mjs";
import {getServiceBinder} from "velor-utils/utils/injection/ServicesContext.mjs";

export class ApiRequestBase {
    #holder;

    constructor(holder) {
        this.#holder = holder;
    }

    initialize() {
        if (!this.#holder) {
            this.#holder = getServiceBinder(this)
                .createInstance(ApiRequestBuilderHolder);
        }
    }

    request() {
        return this.#holder;
    }

    withOptions(options) {
        let holder = this.#holder.clone();
        holder.withOptions(options);
        return getServiceBinder(this).clone(this, holder);
    }

    withRule(rule) {
        let holder = this.#holder.clone();
        holder.withRule(rule);
        return getServiceBinder(this).clone(this, holder);
    }
}