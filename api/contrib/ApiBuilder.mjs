import {RequestBuilderProvider} from "./RequestBuilderProviderMixin.mjs";
import {RuleBuilder} from "../request/RuleBuilder.mjs";
import {bindReplaceResult} from "velor-utils/utils/proxy.mjs";
import {isValidURL} from "velor-utils/utils/urls.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {getApiUrlProvider} from "../application/services/services.mjs";

export class ApiBuilder extends RequestBuilderProvider {
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

    rename(name) {
        this.onBuild(request => {
            request.name = name;
        });
        return this;
    }

    getBuilder(method, nameOrUrl) {
        let rule = this.#rule;
        let options = this.#options ?? {};

        let api = requestWithRule(this, rule, options);
        let builder = api[method](nameOrUrl);
        let urlProvider = getApiUrlProvider(this);

        bindReplaceResult(builder, 'getRequest', request => {
            for (let listener of this.#onBuildListeners) {
                listener(request);
            }
            return request;
        });

        bindReplaceResult(builder, 'getUrl', urlOrName => {
            let url = urlProvider.getUrl(urlOrName);
            if (!isValidURL(url)) {
                url = urlOrName;
            }
            return url;
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