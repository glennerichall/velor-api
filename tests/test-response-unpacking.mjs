import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";


const {
    expect,
    describe,
    it,
    beforeEach,
    afterEach,
    test
} = setupTestContext();

import sinon from 'sinon';
import {ResponseWrapper} from "../api/request/ResponseWrapper.mjs";
import {getDataFromResponse} from "../api/request/getDataFromResponse.mjs";
import {MessageWrapper} from "velor-messaging/messaging/message/MessageWrapper.mjs";
import {getDataFromXhrResponse} from "../api/request/getDataFromXhrResponse.mjs";

test.describe('getDataFromResponse', () => {

    test.describe('getDataFromXhrResponse', () => {

        test('should return response body if content-type is missing', async () => {
            const mockResponse = {
                headers: {
                    get: (header) => null
                },
                body: { data: 'body data' }
            };

            const result = await getDataFromXhrResponse(Promise.resolve(mockResponse));
            expect(result).to.deep.equal(mockResponse.body);
        });

        test('should return response body if content-type is not application/json', async () => {
            const mockResponse = {
                headers: {
                    get: (header) => 'text/html'
                },
                body: { data: 'body data' }
            };

            const result = await getDataFromXhrResponse(Promise.resolve(mockResponse));
            expect(result).to.deep.equal(mockResponse.body);
        });

        test('should return JSON data if content-type is application/json', async () => {
            const mockJsonData = { data: 'json data' };
            const mockResponse = {
                headers: {
                    get: (header) => 'application/json'
                },
                json: () => mockJsonData
            };

            const result = await getDataFromXhrResponse(Promise.resolve(mockResponse));
            expect(result).to.deep.equal(mockJsonData);
        });

        test('should return response body if JSON parsing fails', async () => {
            const mockResponse = {
                headers: {
                    get: (header) => 'application/json'
                },
                body: { data: 'body data' },
                json: () => { throw new Error('Invalid JSON'); }
            };

            const result = await getDataFromXhrResponse(Promise.resolve(mockResponse));
            expect(result).to.deep.equal(mockResponse.body);
        });

        // Edge Case: Null response
        test('should return null if response is null', async () => {
            const result = await getDataFromXhrResponse(Promise.resolve(null));
            expect(result).to.be.null;
        });

        // Edge Case: Undefined response
        test('should return undefined if response is undefined', async () => {
            const result = await getDataFromXhrResponse(Promise.resolve(undefined));
            expect(result).to.be.undefined;
        });

        // Edge Case: Empty response object
        test('should return empty object if response is an empty object', async () => {
            const mockResponse = {
                headers: {
                    get: (header) => null,
                },
                body: {}
            };

            const result = await getDataFromXhrResponse(Promise.resolve(mockResponse));
            expect(result).to.deep.equal({});
        });
    });

    test('should return unpacked data from ResponseWrapper', async () => {
        const mockUnpackedData = {data: 'unpacked data'};
        const mockResponseWrapper = new ResponseWrapper();
        mockResponseWrapper.unpack = () => mockUnpackedData;

        const result = await getDataFromResponse(Promise.resolve(mockResponseWrapper));
        expect(result).to.deep.equal(mockUnpackedData);
    });

    test('should return data from getDataFromXhrResponse for Response instance', async () => {
        const mockXhrData = {data: 'xhr data'};
        const mockResponse = new Response();
        let getDataFromXhrResponse = sinon.stub().returns(mockXhrData);

        const result = await getDataFromResponse(Promise.resolve(mockResponse), {getDataFromXhrResponse});
        expect(result).to.deep.equal(mockXhrData);
    });

    test('should return data from getData for MessageWrapper instance', async () => {
        const mockMessageData = {data: 'message data'};
        const mockMessageWrapper = new MessageWrapper();
        mockMessageWrapper.getData = () => mockMessageData;

        const result = await getDataFromResponse(Promise.resolve(mockMessageWrapper));
        expect(result).to.deep.equal(mockMessageData);
    });

    test('should return body if response has body property', async () => {
        const mockBody = {data: 'body data'};
        const mockResponse = {body: mockBody};

        const result = await getDataFromResponse(Promise.resolve(mockResponse));
        expect(result).to.deep.equal(mockBody);
    });

    test('should return the response itself if it does not match any condition', async () => {
        const mockResponse = {data: 'other response'};

        const result = await getDataFromResponse(Promise.resolve(mockResponse));
        expect(result).to.deep.equal(mockResponse);
    });

    // Edge Case: Null response
    test('should return null if response is null', async () => {
        const result = await getDataFromResponse(Promise.resolve(null));
        expect(result).to.be.null;
    });

    // Edge Case: Undefined response
    test('should return undefined if response is undefined', async () => {
        const result = await getDataFromResponse(Promise.resolve(undefined));
        expect(result).to.be.undefined;
    });

    // Edge Case: Empty response object
    test('should return empty object if response is an empty object', async () => {
        const result = await getDataFromResponse(Promise.resolve({}));
        expect(result).to.deep.equal({});
    });
});