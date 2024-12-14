import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_fetch,
    s_requestStore,
    s_urlProvider
} from "../api/application/services/serviceKeys.mjs";
import {mergeDefaultApiOptions} from "../api/application/services/mergeDefaultApiOptions.mjs";
import {
    getApiUrlProvider,
    getFetch
} from "../api/application/services/services.mjs";
import {MapArray} from "velor-utils/utils/map.mjs";
import {getDataFromResponse} from "../api/ops/getDataFromResponse.mjs";
import {
    createResourceApiWithRuleComposers,
    getItemUrlName,
    getResourceApi,
    ITEM_PARAM
} from "../api/api/ResourceApi.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe("Resource api", () => {
    let services, fetch, urlProvider;

    let composeGetOne,
        composeGetMany,
        composeDelete,
        composeCreate;

    beforeEach(() => {
        services = createAppServicesInstance(
            mergeDefaultApiOptions({
                factories: {
                    [s_fetch]: () => fetch = {
                        send: sinon.stub(),
                        createHeaders: sinon.stub().returns({
                            append: sinon.stub()
                        })
                    },
                    [s_urlProvider]: () => urlProvider = {
                        getUrl(name) {
                            return this.urls[name]
                        },
                        urls: {}
                    },
                    [s_requestStore]: MapArray
                }
            }));

        fetch = getFetch(services);
        urlProvider = getApiUrlProvider(services);

        ({
            composeGetOne,
            composeGetMany,
            composeDelete,
            composeCreate,
        } = createResourceApiWithRuleComposers());
    })

    it('should fetch many', async () => {
        let getMany = composeGetMany(services);

        let expectedResponse = {
            headers: new Map(),
            ok: true,
            body: [
                {
                    a: 'a'
                },
                {
                    b: 'b'
                }
            ]
        };
        expectedResponse.headers.set('content-type', 'application/json');

        fetch.send.returns(expectedResponse);

        urlProvider.urls = {
            'A_RESOURCE_NAME': '/api/v2/my_resource'
        };

        let response = await getMany('A_RESOURCE_NAME', {
            min: 19,
            max: 100
        }).send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource?max=100&min=19');
        expect(args[1]).to.have.property('method', 'GET');

        response = await getDataFromResponse(response);
        expect(response).to.deep.eq(expectedResponse.body);
    })

    it('should fetch one', async () => {
        let getOne = composeGetOne(services);

        let expectedResponse = {
            headers: new Map(),
            ok: true,
            body: {
                'a': 'sdfsdf'
            }
        };
        expectedResponse.headers.set('content-type', 'application/json');
        fetch.send.returns(expectedResponse);
        urlProvider.urls = {
            'A_RESOURCE_NAME_ITEM': `/api/v2/my_resource/:${ITEM_PARAM}`
        };
        let response = await getOne('A_RESOURCE_NAME', 'my-item-id').send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource/my-item-id');
        expect(args[1]).to.have.property('method', 'GET');

        response = await getDataFromResponse(response);
        expect(response).to.deep.eq(expectedResponse.body);
    })

    it('should fetch one with query', async () => {
        let getOne = composeGetOne(services);

        let expectedResponse = {
            ok: true,
            body: {
                'a': 'asdsdfsdf'
            }
        };
        fetch.send.returns(expectedResponse);
        urlProvider.urls = {
            [getItemUrlName('A_RESOURCE_NAME')]: `/api/v2/my_resource/:${ITEM_PARAM}`
        };
        let response = await getOne('A_RESOURCE_NAME', 'my-item-id', {
            fields: ['field1', 'field2'],
        }).send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource/my-item-id?fields=field1&fields=field2');
        expect(args[1]).to.have.property('method', 'GET');

        response = await getDataFromResponse(response);
        expect(response).to.deep.eq(expectedResponse.body);
    })

    it('should create item', async () => {
        let create = composeCreate(services);

        urlProvider.urls = {
            'A_RESOURCE_NAME': '/api/v2/my_resource'
        };
        let data = {
            data1: '234234',
            data2: 123
        };
        let response = await create('A_RESOURCE_NAME').send(data);

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource');
        expect(args[1]).to.have.property('method', 'POST');
        expect(args[1]).to.have.property('body', JSON.stringify(data));
    })

    it('should delete item', async () => {
        let deleteOne = composeDelete(services);

        urlProvider.urls = {
            [getItemUrlName('A_RESOURCE_NAME')]: `/api/v2/my_resource/:${ITEM_PARAM}`
        };
        let response = await deleteOne('A_RESOURCE_NAME', 'my-item-id').send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource/my-item-id');
        expect(args[1]).to.have.property('method', 'DELETE');
    })

    it('should compose resource provider', async()=> {
        urlProvider.urls = {
            [getItemUrlName('A_RESOURCE_NAME')]: `/api/v2/my_resource/:${ITEM_PARAM}`
        };
        let expectedResponse = {
            ok: true,
            body: {
                'a': 'asdsdfsdf'
            }
        };
        fetch.send.returns(expectedResponse);

        let provider = getResourceApi(services).for('A_RESOURCE_NAME');
        let response = await provider.getOne('my-item-id', {
            fields: ['field1', 'field2'],
        }).send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource/my-item-id?fields=field1&fields=field2');
        expect(args[1]).to.have.property('method', 'GET');

        response = await getDataFromResponse(response);
        expect(response).to.deep.eq(expectedResponse.body);
    })

    it('should provider let setting headers', async()=> {
        urlProvider.urls = {
            'A_RESOURCE_NAME': `/api/v2/my_resource`
        };

        let provider = getResourceApi(services).for('A_RESOURCE_NAME');
        let response = await provider.getMany()
            .set('x-custom-header', 'header value')
            .send();

        expect(fetch.send).calledOnce;
        let args = fetch.send.args[0];

        expect(args).to.have.length(2);
        expect(args[0]).to.eq('/api/v2/my_resource');
        expect(args[1]).to.have.property('method', 'GET');
        expect(args[1]).to.have.property('headers');


        expect(args[1].headers.get('x-custom-header')).to.eq('header value');

    })

})