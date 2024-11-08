import {RequestBuilderProvider} from "./RequestBuilderProviderMixin.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {bindReplaceResult} from "velor-utils/utils/proxy.mjs";
import {getServiceBinder} from "velor-utils/utils/injection/ServicesContext.mjs";
import {RuleBuilder} from "../request/RuleBuilder.mjs";

export class ApiRequestBuilderHolder extends RequestBuilderProvider {
    #options = {};
    #ruleBuilder = new RuleBuilder();
    #onBuildListeners = [];
    #onResponseListeners = [];

    get #rule() {
        return this.#ruleBuilder.build();
    }

    onBuild(listener) {
        this.#onBuildListeners.push(listener);
        return this;
    }

    onResponse(listener) {
        this.#onResponseListeners.push(listener);
        return this;
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

    copy(holder) {
        this.#ruleBuilder.append(holder.#rule);
        this.#options = {...holder.#options};
        this.#onBuildListeners.push(...holder.#onBuildListeners);
    }

    rename(name) {
        this.onBuild(request => {
            request.name = name;
        });
        return this;
    }

    clone() {
        let clone = getServiceBinder(this).clone(this);
        clone.copy(this);
        return clone;
    }

    getBuilder(method, nameOrUrl) {
        let rule = this.#rule;
        let options = this.#options ?? {};

        let api = requestWithRule(this, rule, options);
        let builder = api[method](nameOrUrl);

        bindReplaceResult(builder, 'getRequest', request => {
            for (let listener of this.#onBuildListeners) {
                listener(request);
            }
            return request;
        });

        bindReplaceResult(builder, 'send', async response => {
            for (let listener of this.#onResponseListeners) {
                await listener(response);
            }
            return response;
        });


        return builder;
    }
}