import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {ApiRequestBase} from "../api/api/ApiRequestBase.mjs";
import {
    createAppServicesInstance,
    getServiceBinder,
    SCOPE_PROTOTYPE
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {
    s_api, s_fetch,
    s_requestBuilder, s_requestTransmitter
} from "../api/services/apiServiceKeys.mjs";
import {Api} from "../api/api/Api.mjs";
import {createInstance} from "velor-utils/utils/injection/createInstance.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";
import {RequestTransmitter} from "../api/request/RequestTransmitter.mjs";
import sinon from "sinon";

const {
    expect,
    test
} = setupTestContext()

test.describe('ApiRequestBase Class', () => {
    let instance, services, transmitter, stub;

    test.beforeEach(() => {
        services = createAppServicesInstance(
            {
                factories: {
                    [s_api]: createInstance(Api, "https://mybackend.com"),
                    [s_requestBuilder]: {
                        scope: SCOPE_PROTOTYPE,
                        clazz: RequestBuilder,
                    },
                    [s_requestTransmitter]: {
                        scope: SCOPE_PROTOTYPE,
                        factory: (services, builder) => {
                            transmitter = new RequestTransmitter(builder);
                            stub = sinon.stub(transmitter, 'send').returns({});
                            return transmitter;
                        },
                    }
                }
            }
        );
        instance = getServiceBinder(services).createInstance(ApiRequestBase);
    })

    test.describe('getter methods', () => {
        test('should have correct default values', () => {
            expect(instance.api).to.be.an('object');
            expect(instance.api).to.be.an.instanceOf(Api);
            expect(instance.options).to.be.an('object').that.is.empty;
        });

        test('should have the correctly updated values', () => {
            services = createAppServicesInstance(
                {
                    factories: {
                        [s_api]: createInstance(Api, "https://mybackend.com")
                    }
                }
            );
            instance = getServiceBinder(services).createInstance(ApiRequestBase, {key: 'value'});
            expect(instance.options).to.deep.equal({key: 'value'});
        });
    });

    test.describe('withOptions()', () => {
        test('should return a new instance with updated options', () => {
            let newInstance = instance.withOptions({key: 'value2'});
            expect(newInstance.options).to.deep.equal({key: 'value2'});
        });
    });

    test.describe('HTTP verbs methods', () => {
        test('should GET request from builder', () => {
            let builder = instance.get('/an/url/to/a/resource');
            expect(builder).be.an.instanceOf(RequestBuilder);
            let request = builder.getRequest();

            expect(request).excluding('abort').to.deep.eq({
                "url": "/an/url/to/a/resource",
                "options": {
                    "method": "GET",
                    "credentials": "include",
                    "mode": "cors",
                    "signal": {},
                    body: undefined,
                    headers: undefined
                }
            });
        });

        test('should apply options to request from builder', () => {
            let builder = instance
                .withOptions({key: 'value2'})
                .get('/an/url/to/a/:resource')
                .param('resource', 'images')
                .query('foo', 'bar');

            expect(builder.getRequest()).excluding('abort').to.deep.eq({
                "url": "/an/url/to/a/images?foo=bar",
                "options": {
                    "method": "GET",
                    "credentials": "include",
                    "mode": "cors",
                    "signal": {},
                    key: 'value2',
                    body: undefined,
                    headers: undefined
                }
            });
        });

        test('should prepare requestBuilder for POST', () => {
            let builder = instance.post('/an/url/to/a/resource');
            let request = builder.getRequest();

            expect(request).excluding('abort').to.deep.eq({
                "url": "/an/url/to/a/resource",
                "options": {
                    "method": "POST",
                    "credentials": "include",
                    "mode": "cors",
                    "signal": {},
                    body: undefined,
                    headers: undefined
                }
            });
        });

        test('should prepare requestBuilder for DELETE', () => {
            let builder = instance.delete('/an/url/to/a/resource');
            let request = builder.getRequest();

            expect(request).excluding('abort').to.deep.eq({
                "url": "/an/url/to/a/resource",
                "options": {
                    "method": "DELETE",
                    "credentials": "include",
                    "mode": "cors",
                    "signal": {},
                    body: undefined,
                    headers: undefined
                }
            });
        });

        test('should prepare requestBuilder for PUT', () => {
            let builder = instance.put('/an/url/to/a/resource');
            let request = builder.getRequest();

            expect(request).excluding('abort').to.deep.eq({
                "url": "/an/url/to/a/resource",
                "options": {
                    "method": "PUT",
                    "credentials": "include",
                    "mode": "cors",
                    "signal": {},
                    body: undefined,
                    headers: undefined
                }
            });
        });
    });

    test.describe('sending', () => {
        test('should call transmitter send', async () => {
            let builder = instance.get('/an/url/to/a/resource');
            await builder.send();
            expect(stub.calledOnce).to.be.true;
        })
    })

    test.describe('listener', () => {
        test('should call listener', async () => {
            let callback = sinon.spy();
            instance.setListener(callback);

            let builder = instance.get('/an/url/to/a/resource');
            await builder.send();

            expect(callback.callCount).to.equal(1);
            expect(callback.calledWith(builder)).to.be.true;


        })
    })
});