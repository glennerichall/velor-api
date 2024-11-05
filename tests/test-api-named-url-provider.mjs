import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {request} from "../api/composers/request.mjs";
import {
    createAppServicesInstance,
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
import {RequestInvoker} from "../api/request/RequestInvoker.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";
import sinon from "sinon";

const {
    expect,
    test
} = setupTestContext();

test.describe('NamedUrlProvider', () => {
    let services, regulator;

    test.beforeEach(() => {
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
    })

    test('should return the url from its name', async () => {

        let req = await request(services, {a: 'b'}).get('URL_NAME')
            .query('baz', 'qux')
            .param('foo', 'bar');


    })
})