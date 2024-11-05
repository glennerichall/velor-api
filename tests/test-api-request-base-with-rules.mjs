import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext();

import sinon from 'sinon';

import {
    createAppServicesInstance,
    getServiceBinder
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {requestWithRule} from "../api/composers/requestWithRule.mjs";
import {request} from "../api/composers/request.mjs";
import {RuleBuilder} from "../api/request/RuleBuilder.mjs";
import {
    s_requestInvoker,
    s_requestRegulator
} from "../api/services/apiServiceKeys.mjs";
import {unpackResponse} from "../api/request/unpackResponse.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";


export class OptionsHolder {
    #options;

    constructor(options) {
        this.#options = options ?? {};
    }

    get options() {
        return this.#options;
    }

    withOptions(options = {}) {
        return getServiceBinder(this).clone(this, {
            ...this.#options,
            ...options
        });
    }
}

export const ApiRuledRequestMixin = Parent => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    requestWithRule(ruleBuilder) {
        return requestWithRule(this, ruleBuilder.build(), this.options)
    }

    get rules() {
        return new RuleBuilder();
    }
}

export const ApiRequestMixin = Parent => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    request() {
        return request(this, this.options);
    }
}

export const ApiRequestStoreMixin = (store, Parent) => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    store(key) {
        return async response => {
            let data = await unpackResponse(response);
            store(key, data);
            return response;
        };
    }
}

export const CaptureMixin = (ParentMixin, method, capture) => Parent =>
    class extends ParentMixin(Parent) {
        [method](...args) {

        }
    }


export const RequestBuilderMixin = Parent => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    getBuilder(...args) {
        throw new NotImplementedError();
    }

    get(urlOrName) {
        this.getBuilder('get', urlOrName);
    }

    post(urlOrName) {
        this.getBuilder('post', urlOrName);
    }

    put(urlOrName) {
        this.getBuilder('put', urlOrName);
    }

    delete(urlOrName) {
        this.getBuilder('delete', urlOrName);
    }

}

const store = (key, value) => {
    console.log('store', key, value);
};

const ApiRequestBase =
    CaptureMixin(ApiRuledRequestMixin, 'requestWithRule')(
        CaptureMixin(ApiRequestMixin, 'request')(
            ApiRequestStoreMixin(
                store, OptionsHolder
            )));


class UserApiExample extends ApiRequestBase {
    constructor(options) {
        super(options);
    }

    async getSystemStatus() {
        return this.store('APP_SYSTEM_STATUS')(this
            .requestWithRule(this.rules.doNotFailFor(401, 403))
            .get('URL_SYSTEM_SESSION_COUNT')
            .send()
        );
    }

    getProfile() {
        return this.store('APP_PROFILE')(this
            .requestWithRule(this.rules.retry(3))
            .get('URL_PROFILE')
            .send());
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
        instance = new UserApiExample({initialOption: true});
        getServiceBinder(services).autoWire(instance);
    });


    it('should be able to provide rule', async () => {
        let response = await instance.getSystemStatus();

    })

});

