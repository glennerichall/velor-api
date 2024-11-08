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
import {ApiRequestBase} from "../api/contrib/ApiRequestBase.mjs";
import {ApiRequestBuilderHolder} from "../api/contrib/ApiRequestBuilderHolder.mjs";
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";

const {
    expect, describe, it, beforeEach
} = setupTestContext();

const alwaysSendRule = sinon.stub();
const doNotThrowOnStatusRule = sinon.stub().returns(sinon.stub());
const retryRule = sinon.stub().returns(sinon.stub());


describe('ApiRequestBase', () => {
    let instance, services, regulator, store;

    beforeEach(() => {
        regulator = {
            accept: sinon.stub()
        };
        services = createAppServicesInstance({
            factories: {
                [s_api]: Api,
                [s_requestInvoker]: RequestInvoker,
                [s_requestBuilder]: {
                    scope: SCOPE_SINGLETON,
                    clazz: RequestBuilder
                },
                [s_requestRegulator]: () => regulator,
                [s_fetch]: () => fetch = {
                    send: sinon.stub(),
                    createHeaders: sinon.stub().returns({
                        append: sinon.stub()
                    })
                }
            }
        });
        let holder = getServiceBinder(services).createInstance(ApiRequestBuilderHolder, store);
        instance = new ApiRequestBase(holder);
        getServiceBinder(services).autoWire(instance);
    });

    it('should capture build', () => {
        let request = instance.request()
            .onBuild(request => {
                request.foo = 'bar';
            }).onBuild(request => {
                request.baz = 'qux';
            })
            .get('/an/url')
            .getRequest();

        expect(request).to.have.property('foo', 'bar');
        expect(request).to.have.property('baz', 'qux');
    })

    it('should capture response', async () => {
        let value;
        regulator.accept.returns("toto")
        let response = await instance.request()
            .onResponse(async response => {
                value = response
                return Promise.resolve();
            })
            .get('/an/url')
            .send();

        expect(response).to.eq("toto");
        expect(value).to.eq(response);
    })


    it('should have correct request name', () => {
        let request = instance.request()
            .get('/an/url')
            .getRequest();

        expect(request.name).to.be.undefined;
    })

    it('should rename request', async () => {
        let result = {};
        regulator.accept.returns(result);
        let request = await instance.request()
            .rename('request-name')
            .get('/an/url')
            .getRequest();

        expect(request).to.have.property('name', 'request-name');
    })

    it('should not memoize requests', async () => {
        let result = 'request-response';
        regulator.accept.returns(result);

        await instance.request()
            .rename('request-name')
            .get('/an/url')
            .getRequest();

        let request2 = await instance.request()
            .post('/another/url')
            .getRequest();

        expect(request2.url).to.eq('/another/url');
        expect(request2.name).to.be.undefined;
        expect(request2.options.method).to.eq('POST');
    })

    it('should be able to provide rule', async () => {
        let result = {};
        regulator.accept.returns(result);
        let response = await instance.getSystemStatus();

        expect(regulator.accept.calledOnce).to.be.true;

        let expectedArg1 = {
            "url": "URL_SYSTEM_SESSION_COUNT",
            "options": {
                "method": "GET",
            },
            "name": "APP_SYSTEM_STATUS"
        };
        let args = regulator.accept.args[0];
        expect(args).to.have.length(3);
        expect(args[0].url).to.eq(expectedArg1.url);
        expect(args[0].options?.method).to.eq(expectedArg1.options.method);
        expect(args[0].name).to.eq("APP_SYSTEM_STATUS");

        let bidon = response;
    })

    it('should be able to provide change how request is made', async () => {
        let response = await instance
            .withOptions({foo: 'bar'})
            .withRule(alwaysSendRule)
            .getSystemStatus();
    })

});

