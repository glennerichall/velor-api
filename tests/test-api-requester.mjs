import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from "sinon";
import {composeSendRequest} from "../api/composers/composeSendRequest.mjs";
import {
    createAppServicesInstance,
    SCOPE_PROTOTYPE
} from "velor-services/injection/ServicesContext.mjs";
import {
    s_api,
    s_fetch,
    s_requestBuilder,
    s_requestInvoker,
    s_requestRegulator
} from "../api/application/services/serviceKeys.mjs";
import {Api} from "../api/api/Api.mjs";
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";
import {request} from "../api/composers/request.mjs";
import {requestWithRule} from "../api/composers/requestWithRule.mjs";
import {alwaysSendRule} from "../api/ops/rules.mjs";
import {getRequestInvoker} from "../api/application/services/services.mjs";
import {mergeDefaultApiOptions} from "../api/application/services/mergeDefaultApiOptions.mjs"; // Update the path to your module

const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext();

describe('requester', () => {

    describe('createApiRequester', () => {
        let services, fetch, regulator;

        beforeEach(() => {
            services = createAppServicesInstance(
                mergeDefaultApiOptions({
                    factories: {
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
                }));
        })

        it('should create method send to builder', () => {
            let builder = request(services).get('an/url');
            expect(builder).to.be.an.instanceof(RequestBuilder);
            expect(builder.send).to.be.a('function');
        })

        it('should call fetch with built options and url', async () => {
            await request(services, {a: 'b'}).get('/an/url/:foo')
                .query('baz', 'qux')
                .param('foo', 'bar').send('a body');

            let args = fetch.send.args[0];
            expect(args).to.have.length(2);

            let [url, options] = args;

            expect(url).to.eq('/an/url/bar?baz=qux');

            expect(options).excluding(['headers', 'signal']).to.deep.eq({
                body: 'a body',
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
                a: 'b'
            });

            expect(options.headers.get( 'X-Requested-With')).to.eq('XMLHttpRequest')
        })

        it('should create method send for ruled', () => {
            let builder = requestWithRule(services, alwaysSendRule).get('an/url');
            expect(builder).to.be.an.instanceof(RequestBuilder);
            expect(builder.send).to.be.a('function');
        })

        it('should call regulator', async () => {
            await requestWithRule(services, alwaysSendRule).get('/an/url').send();

            expect(regulator.accept.calledOnce).to.be.true;

            let args = regulator.accept.args[0];

            expect(args).to.have.length(3);

            let [request, invoker, rule] = args;

            let {options, url} = request;

            expect(url).to.eq('/an/url');

            expect(options).excluding(['headers', 'signal']).to.deep.eq({
                body: undefined,
                method: 'GET',
                credentials: 'include',
                mode: 'cors'
            });

            expect(invoker).to.eq(getRequestInvoker(services));
            expect(rule).to.eq(alwaysSendRule);
        })
    })

    describe('composeRequestTransmitter', () => {
        let mockInvoker;
        let mockBuilder;
        let mockRequest;

        beforeEach(() => {
            // We create a mock for the invoker and the builder to isolate the function's behavior
            mockInvoker = {
                send: sinon.stub()
            };
            mockBuilder = {
                set: sinon.stub(),
                setContent: sinon.stub(),
                getRequest: sinon.stub()
            };
            mockRequest = 'mockRequest';
        });

        it('should set the header and send the request without data', () => {
            mockBuilder.getRequest.returns('mockRequest');
            mockInvoker.send.returns('mockResponse');
            const transmitter = composeSendRequest(mockInvoker);

            expect(transmitter(mockBuilder)).to.exist;

            sinon.assert.calledWith(mockBuilder.set, 'X-Requested-With', 'XMLHttpRequest');
            sinon.assert.notCalled(mockBuilder.setContent);
            sinon.assert.calledWith(mockInvoker.send, mockRequest);
        });

        it('should set the header and content then send the request with data', () => {
            const mockData = 'mockData';
            mockBuilder.getRequest.returns(mockRequest);
            mockInvoker.send.returns('mockResponse');
            const transmitter = composeSendRequest(mockInvoker);

            expect(transmitter(mockBuilder, mockData)).to.exist;

            sinon.assert.calledWith(mockBuilder.set, 'X-Requested-With', 'XMLHttpRequest');
            sinon.assert.calledWith(mockBuilder.setContent, mockData);
            sinon.assert.calledWith(mockInvoker.send, mockRequest);
        });
    });
})