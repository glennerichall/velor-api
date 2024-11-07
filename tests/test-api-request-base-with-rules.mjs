import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from 'sinon';

import {
    createAppServicesInstance,
    getServiceBinder,
    SCOPE_SINGLETON
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {
    s_api,
    s_fetch,
    s_requestBuilder,
    s_requestInvoker,
    s_requestRegulator
} from "../api/services/apiServiceKeys.mjs";
import {Api} from "../api/api/Api.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";
import {ApiRequestBase} from "../api/contrib/ApiRequestBase.mjs";

const {
    expect, describe, it, beforeEach
} = setupTestContext();

const alwaysSendRule = sinon.stub();
const doNotThrowOnStatusRule = sinon.stub().returns(sinon.stub());
const retryRule = sinon.stub().returns(sinon.stub());

class Store {
    #states = {};

    setState(key, value) {
        this.#states[key] = value;
    }

    getState(key) {
        return this.#states[key];
    }
}

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
    let instance, services, regulator;

    beforeEach(() => {
        services = createAppServicesInstance({
            factories: {
                [s_api]: Api,
                [s_requestInvoker]: RequestInvoker,
                [s_requestBuilder]: {
                    scope: SCOPE_SINGLETON,
                    clazz: RequestBuilder
                },
                [s_requestRegulator]: () => regulator = {
                    accept: sinon.stub()
                },
                [s_fetch]: () => fetch = {
                    send: sinon.stub(),
                    createHeaders: sinon.stub().returns({
                        append: sinon.stub()
                    })
                }
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

