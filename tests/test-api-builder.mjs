import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from 'sinon';

import {
    createAppServicesInstance,
    SCOPE_PROTOTYPE,
} from "velor-utils/injection/ServicesContext.mjs";
import {
    s_api,
    s_apiBuilder,
    s_fetch,
    s_requestBuilder,
    s_requestInvoker,
    s_requestRegulator,
    s_urlProvider
} from "../api/services/apiServiceKeys.mjs";
import {Api} from "../api/api/Api.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";
import {ApiBuilder} from "../api/contrib/ApiBuilder.mjs";
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";
import {
    getApiBuilder,
    getApiUrlProvider
} from "../api/services/apiServices.mjs";
import {request} from "../api/composers/request.mjs";

const {
    expect, describe, it, beforeEach
} = setupTestContext();

const alwaysSendRule = sinon.stub();


describe('ApiRequestBase', () => {
    let instance, services, regulator;

    beforeEach(() => {
        regulator = {
            accept: sinon.stub()
        };
        services = createAppServicesInstance({
            factories: {
                [s_api]: Api,
                [s_requestInvoker]: RequestInvoker,
                [s_requestBuilder]: {
                    scope: SCOPE_PROTOTYPE,
                    clazz: RequestBuilder
                },
                [s_apiBuilder]: {
                    scope: SCOPE_PROTOTYPE,
                    clazz: ApiBuilder
                },
                [s_requestRegulator]: () => regulator,
                [s_fetch]: () => fetch = {
                    send: sinon.stub(),
                    createHeaders: sinon.stub().returns({
                        append: sinon.stub()
                    })
                },
                [s_urlProvider]: () => {
                    return {
                        getUrl: sinon.stub()
                    }
                }
            }
        });
        instance = getApiBuilder(services);
    });

    it('should capture build', () => {
        let request = instance
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
        let response = await instance
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
        let request = instance
            .rename('foo.bar')
            .get('/an/url')
            .getRequest();

        expect(request.name).to.eq('foo.bar');
    })

    it('should rename request', async () => {
        let result = {};
        regulator.accept.returns(result);
        let request = await instance
            .rename('request-name')
            .get('/an/url')
            .getRequest();

        expect(request).to.have.property('name', 'request-name');
    })

    it('should be able to provide rule', async () => {
        let result = {};
        regulator.accept.returns(result);
        instance
            .withRule(alwaysSendRule)
            .rename('APP_SYSTEM_STATUS')
            .get('/an/url')
            .send();

        expect(regulator.accept.calledOnce).to.be.true;

        let args = regulator.accept.args[0];

        expect(args).to.have.length(3);
        expect(args[0].url).to.eq('/an/url');
        expect(args[0].options?.method).to.eq('GET');

        expect(args[0].name).to.eq("APP_SYSTEM_STATUS");

        expect(args[1]).to.be.an.instanceof(RequestInvoker);
        expect(args[2]).to.be.a('function');
        args[2]();

        expect(alwaysSendRule.calledOnce).to.be.true;
    })

    it('should be able to provide change how request is made', async () => {
        let request = await instance
            .withOptions({foo: 'bar'})
            .withRule(alwaysSendRule)
            .get('/an/url')
            .getRequest();

        expect(request.options).to.have.property('foo', 'bar');
    })



    it('should return the url from its name', async () => {
        getApiUrlProvider(services).getUrl.withArgs('URL_NAME').returns('http://localhost/an/url/:foo/too')
        let req = await instance.get('URL_NAME')
            .query('baz', 'qux')
            .param('foo', 'bar')
            .getRequest();

        expect(req.url).to.eq('http://localhost/an/url/bar/too?baz=qux');
    })

    it('should use if name not found in provider', async () => {
        getApiUrlProvider(services).getUrl.withArgs('URL_NAME').returns('http://localhost/an/url/:foo/too')
        let req = await instance.get('URL_NAME_DOES_NOT_EXISTS')
            .query('baz', 'qux')
            .param('foo', 'bar')
            .getRequest();

        expect(req.url).to.eq('URL_NAME_DOES_NOT_EXISTS?baz=qux');
    })

});

