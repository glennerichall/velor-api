import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect, describe, it, beforeEach
} = setupTestContext();

import sinon from 'sinon';

import {
    createAppServicesInstance, getServiceBinder
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {requestWithRule} from "../api/composers/requestWithRule.mjs";
import {RuleBuilder} from "../api/request/RuleBuilder.mjs";
import {
    s_requestInvoker, s_requestRegulator
} from "../api/services/apiServiceKeys.mjs";
import {unpackResponse} from "../api/request/unpackResponse.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {bindReplaceResult} from "velor-utils/utils/proxy.mjs";

export const RequestBuilder = Parent => class extends Parent {

    getBuilder(...args) {
        throw new NotImplementedError();
    }

    get(urlOrName) {
        return this.getBuilder('get', urlOrName);
    }

    post(urlOrName) {
        return this.getBuilder('post', urlOrName);
    }

    put(urlOrName) {
        return this.getBuilder('put', urlOrName);
    }

    delete(urlOrName) {
        return this.getBuilder('delete', urlOrName);
    }

}

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

export class ApiRequestBuilderHolder extends RequestBuilder(ApiRequestHolder) {
    #services;
    #store;

    constructor(services, store) {
        super();
        this.#services = services;
        this.#store = store;
    }

    clone() {
        return new this.constructor(this.#services, this.#store);
    }

    getBuilder(method, nameOrUrl) {
        let rule = this.rule;
        let options = this.options ?? {};
        let services = this.#services;
        let key = this.key;

        let api = requestWithRule(services, rule, options);
        let builder = api[method](nameOrUrl);

        if (key) {
            bindReplaceResult(builder, 'getRequest', request => {
                request.name = key;
                return request;
            });
            bindReplaceResult(builder, 'send', async response => {
                let body = await unpackResponse(response);
                this.#store.setState(key, body);
                return response;
            });
        }

        return builder;
    }
}

class ApiRequestBase {
    #holder;

    constructor(holder) {
        this.#holder = holder ?? new ApiRequestBuilderHolder(this);
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

const alwaysSendRule = sinon.stub();
const doNotThrowOnStatusRule = sinon.stub().returns(sinon.stub());
const retryRule = sinon.stub().returns(sinon.stub());

class UserApiExample extends ApiRequestBase {

    constructor(...args) {
        super(...args);
    }

    async getSystemStatus(query) {
        return this.request()
            .saveTo('APP_SYSTEM_STATUS')
            .withRule(doNotThrowOnStatusRule(401, 403))
            .get('URL_SYSTEM_SESSION_COUNT')
            .query(query)
            .send();
    }

    getProfile() {
        return this
            .withRule(retryRule(3))
            .saveTo('APP_PROFILE')
            .get('URL_PROFILE')
            .send();
    }
}

describe('ApiRequestBase', () => {
    let instance, services;

    beforeEach(() => {
        services = createAppServicesInstance({
            factories: {
                [s_requestInvoker]: {},
                [s_requestRegulator]: {}
            }
        });
        instance = new UserApiExample();
        getServiceBinder(services).autoWire(instance);
    });


    it('should be able to provide rule', async () => {
        let response = await instance.getSystemStatus();
    })

    it('should be able to provide change how request is made', async () => {
        let response = await instance
            .withOptions({foo: 'bar'})
            .withRule(alwaysSendRule)
            .getSystemStatus();
    })

});

