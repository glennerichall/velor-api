import sinon from 'sinon';
import {
    createAppServicesInstance,
    getServiceBinder,
} from "velor-services/injection/ServicesContext.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {s_fetch} from "../api/application/services/apiServiceKeys.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('RequestBuilder with DI and ServicesContext', function () {
    let fetchStub;
    let services;
    let requestBuilder;

    test.beforeEach(function () {
        // Stub methods for fetch and headers
        fetchStub = {
            createHeaders: sinon.stub().returns({
                append: sinon.stub()
            })
        };

        // Create a new ServicesContext with a singleton scope for s_fetch
        services = createAppServicesInstance({
            factories: {
                [s_fetch]: ()=> fetchStub // Inject the mock fetch service
            }
        });

        // Use getServiceBinder to create an instance of RequestBuilder with the injected services
        requestBuilder = getServiceBinder(services).createInstance(RequestBuilder, 'GET', 'https://example.com');
    });

    test.afterEach(function () {
        sinon.restore();
    });

    test.describe('set() method', function () {
        test('should set headers using createHeaders from fetch', function () {
            requestBuilder.set('Authorization', 'Bearer token');

            const headersStub = fetchStub.createHeaders();
            expect(headersStub.append.calledOnce).to.be.true;
            expect(headersStub.append.calledWith('Authorization', 'Bearer token')).to.be.true;
        });
    });

    test.describe('option() and options() methods', function () {
        test('should set a single option', function () {
            requestBuilder.option('cache', 'no-cache');
            const options = requestBuilder.buildOptions();
            expect(options.cache).to.equal('no-cache');
        });

        test('should set multiple options', function () {
            requestBuilder.options({
                cache: 'no-cache',
                redirect: 'follow'
            });
            const options = requestBuilder.buildOptions();
            expect(options.cache).to.equal('no-cache');
            expect(options.redirect).to.equal('follow');
        });
    });

    test.describe('noAbort() method', function () {
        test('should prevent the use of AbortController', function () {
            requestBuilder.noAbort();
            const options = requestBuilder.buildOptions();
            expect(options.signal).to.be.undefined; // no signal if aborting is disabled
        });
    });

    test.describe('setContent() method', function () {
        test('should set JSON content and the correct content-type', function () {
            const data = {key: 'value'};
            requestBuilder.setContent(data);
            const options = requestBuilder.buildOptions();

            const headersStub = fetchStub.createHeaders();
            expect(headersStub.append.calledWith('Content-Type', 'application/json')).to.be.true;
            expect(options.body).to.equal(JSON.stringify(data));
        });

        test('should set ArrayBuffer content and the correct content-type', function () {
            const buffer = new ArrayBuffer(8);
            requestBuilder.setContent(buffer);
            const options = requestBuilder.buildOptions();

            const headersStub = fetchStub.createHeaders();
            expect(headersStub.append.calledWith('Content-Type', 'application/octet-stream')).to.be.true;
            expect(options.body).to.equal(buffer);
        });
    });

    test.describe('getRequest() method', function () {
        test('should return the correct request object', function () {
            const request = requestBuilder.getRequest();
            expect(request.url).to.equal('https://example.com');
            expect(request.options.method).to.equal('GET');
            expect(request.abort).to.be.a('function');
        });

        test('should abort the request when calling abort()', function () {
            const request = requestBuilder.getRequest();
            const controller = requestBuilder.getController();
            const abortSpy = sinon.spy(controller, 'abort');

            request.abort(); // Call the abort method

            expect(abortSpy.calledOnce).to.be.true;
        });
    });
});

