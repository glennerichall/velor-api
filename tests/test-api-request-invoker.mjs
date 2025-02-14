import sinon from 'sinon';
import {
    createAppServicesInstance,
    getServiceBinder,
    SCOPE_SINGLETON,
} from "velor-services/injection/ServicesContext.mjs";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {s_fetch} from "../api/application/services/serviceKeys.mjs";
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";
import {getFetch} from "../api/application/services/services.mjs";
import {BackendError} from "../api/BackendError.mjs";


const {
    expect,
    test
} = setupTestContext();

test.describe('RequestInvoker', function () {
    let fetchStub;
    let services;
    let requestInvoker;

    test.beforeEach(function () {
        services = createAppServicesInstance({
            factories: {
                [s_fetch]: sinon.stub().returns({
                    send: sinon.stub()
                })
            }
        });

        requestInvoker = getServiceBinder(services).createInstance(RequestInvoker);
        fetchStub = getFetch(services);
    });

    test.afterEach(function () {
        sinon.restore();
    });

    test.describe('validateResponse', function () {
        test('should throw BackendError for non-ok and non-redirect response', async function () {
            const request = {
                url: 'https://example.com',
                options: {method: 'GET'}
            };

            const response = {
                ok: false,
                redirect: false,
                status: 404,
                headers: {
                    get: sinon.stub().returns('text/plain')
                },
                text: sinon.stub().resolves('Not Found')
            };

            await expect(requestInvoker.validateResponse(request, response))
                .to.be.rejectedWith(BackendError, 'Not Found');


        });

        test('should return response for ok response', async function () {
            const request = {
                url: 'https://example.com',
                options: {method: 'GET'}
            };

            const response = {
                ok: true,
                redirect: false,
                headers: {
                    get: sinon.stub().returns('application/json')
                }
            };

            const validatedResponse = await requestInvoker.validateResponse(request, response);
            expect(validatedResponse).to.equal(response);
        });
    });

    test.describe('send', function () {
        test('should return a ResponseWrapper for a successful request', async function () {
            const request = {
                url: 'https://example.com',
                options: {method: 'GET'}
            };

            const response = {
                ok: true,
                redirect: false,
                headers: {
                    get: sinon.stub().returns('application/json')
                }
            };

            fetchStub.send.resolves(response);

            const result = await requestInvoker.send(request);
            expect(result.unpack).to.be.a('function');
            expect(result.json).to.be.a('function');
        });

        test('should throw BackendError if fetch throws an error', async function () {
            const request = {
                url: 'https://example.com',
                options: {method: 'GET'}
            };

            fetchStub.send.rejects(new Error('Network Error'));

            await expect(requestInvoker.send(request))
                .to.be.rejectedWith(BackendError, 'Network Error');
        });

        test('should throw BackendError if response is not ok', async function () {
            const request = {
                url: 'https://example.com',
                options: {method: 'GET'}
            };

            const response = {
                ok: false,
                redirect: false,
                status: 500,
                headers: {
                    get: sinon.stub().returns('application/json')
                },
                json: sinon.stub().resolves(new Error('Server Error'))
            };

            fetchStub.send.resolves(response);

            try {
                await requestInvoker.send(request);
            }catch(error) {
                expect(error).to.be.instanceOf(BackendError);
                expect(error.status).to.equal(500);
                expect(error.message).to.equal('500 : Error: Server Error [from https://example.com]');
                expect(error.url).to.equal('https://example.com');
            }
        });
    });
});
