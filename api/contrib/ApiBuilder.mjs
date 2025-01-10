import {RequestBuilderProvider} from "./RequestBuilderProviderMixin.mjs";
import {RuleBuilder} from "../request/RuleBuilder.mjs";
import {bindReplaceResult} from "velor-utils/utils/proxy.mjs";
import {isValidURL} from "velor-utils/utils/urls.mjs";
import {requestWithRule} from "../composers/requestWithRule.mjs";
import {getApiUrlProvider} from "../application/services/services.mjs";

const kg_rule = Symbol("rule");
const kp_options = Symbol("options");
const kp_ruleBuilder = Symbol("ruleBuilder");
const kp_onBuildListeners = Symbol("onBuildListeners");
const kp_onResponseListeners = Symbol("onResponseListeners");

export class ApiBuilder extends RequestBuilderProvider {

    
    constructor() {
        super();
        this[kp_options] = {};
        this[kp_ruleBuilder] = new RuleBuilder();
        this[kp_onBuildListeners] = [];
        this[kp_onResponseListeners] = [];
    }

    get [kg_rule]() {
        return this[kp_ruleBuilder].build();
    }

    onBuild(listener) {
        this[kp_onBuildListeners].push(listener);
        return this;
    }

    onResponse(listener) {
        this[kp_onResponseListeners].push(listener);
        return this;
    }

    withOptions(options = {}) {
        this[kp_options] = {
            ...this[kp_options], ...options
        };
        return this;
    }

    withRule(rule) {
        this[kp_ruleBuilder].append(rule);
        return this;
    }

    rename(name) {
        this.onBuild(request => {
            request.name = name;
        });
        return this;
    }

    getBuilder(method, nameOrUrl) {
        let rule = this[kg_rule];
        let options = this[kp_options] ?? {};

        let api = requestWithRule(this, rule, options);
        let builder = api[method](nameOrUrl);
        let urlProvider = getApiUrlProvider(this);

        bindReplaceResult(builder, 'getRequest', request => {
            for (let listener of this[kp_onBuildListeners]) {
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
            for (let listener of this[kp_onResponseListeners]) {
                await listener(response);
            }
            return response;
        });


        return builder;
    }
}