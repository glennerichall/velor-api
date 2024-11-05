import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";


const {
    expect,
    describe,
    it,
    beforeEach,
    afterEach
} = setupTestContext();

import sinon from 'sinon';
import {ResponseWrapper} from "../api/request/ResponseWrapper.mjs";


describe('ResponseWrapper', () => {
    let response, responseWrapper, getDataFromResponseStub;

    beforeEach(() => {
        response = {
            headers: { 'content-type': 'application/json' },
            ok: true,
            status: 200,
            body: '{}',
        };
        getDataFromResponseStub = sinon.stub().resolves({ key: 'value' });
        responseWrapper = new ResponseWrapper(response);
        sinon.stub(responseWrapper, 'unpack').callsFake(getDataFromResponseStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('headers', () => {
        it('should return the headers from the response', () => {
            expect(responseWrapper.headers).to.eql(response.headers);
        });
    });

    describe('ok', () => {
        it('should return the ok status from the response', () => {
            expect(responseWrapper.ok).to.equal(response.ok);
        });
    });

    describe('status', () => {
        it('should return the status from the response', () => {
            expect(responseWrapper.status).to.equal(response.status);
        });
    });

    describe('body', () => {
        it('should return the unpacked data', async () => {
            const data = await responseWrapper.body;
            expect(data).to.eql({ key: 'value' });
        });
    });

    describe('unpack', () => {

        it('should return the data from getDataFromResponse', async () => {
            const data = await responseWrapper.unpack();
            expect(data).to.eql({ key: 'value' });
        });

        it('should handle cases where response is null', async () => {
            responseWrapper = new ResponseWrapper(null);
            try {
                await responseWrapper.unpack();
            } catch (e) {
                expect(e).to.be.instanceOf(TypeError);
            }
        });
    });

    describe('json', () => {
        it('should return the same result as unpack', async () => {
            const unpackData = await responseWrapper.unpack();
            const jsonData = await responseWrapper.json();
            expect(jsonData).to.eql(unpackData);
        });
    });

    describe('edge cases', () => {
        it('should handle cases where response headers are missing', () => {
            response.headers = null;
            responseWrapper = new ResponseWrapper(response);
            expect(responseWrapper.headers).to.be.null;
        });

        it('should handle cases where response body is an empty string', async () => {
            response.body = '';
            getDataFromResponseStub.resolves({});
            const data = await responseWrapper.unpack();
            expect(data).to.eql({});
        });

        it('should handle cases where response ok is false', () => {
            response.ok = false;
            responseWrapper = new ResponseWrapper(response);
            expect(responseWrapper.ok).to.be.false;
        });

        it('should handle cases where response status is an error code', () => {
            response.status = 500;
            responseWrapper = new ResponseWrapper(response);
            expect(responseWrapper.status).to.equal(500);
        });
    });
});
