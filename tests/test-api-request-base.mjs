import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext();

import sinon from 'sinon';
import {
    ApiRequestBase,
    ApiRequestMixin
} from "../api/contrib/ApiRequestMixin.mjs";
import {
    createAppServicesInstance,
    getServiceBinder
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {RequestBuilderBase} from "../api/contrib/RequestBuilderBase.mjs";


// Mock modules
const requestMock = sinon.stub().returns({
    get: sinon.stub(),
    post: sinon.stub(),
});

// Class to be tested
const ApiRequest = ApiRequestMixin(ApiRequestBase, requestMock);

describe('ApiRequestMixin', () => {
    let instance, services;

    beforeEach(() => {
        services = createAppServicesInstance();
        instance = new ApiRequest({initialOption: true});
        getServiceBinder(services).autoWire(instance);
    });

    describe('RequestBuilderBase', () => {
        let instance;

        beforeEach(() => {
            instance = new RequestBuilderBase();
        });

        describe('getBuilder', () => {
            it('should throw NotImplementedError', () => {
                expect(() => instance.getBuilder()).to.throw(Error);
            });
        });

        describe('get', () => {
            it('should call getBuilder with correct arguments', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder');
                instance.get('test-url');
                expect(getBuilderStub.calledOnceWith('get', 'test-url')).to.be.true;
                getBuilderStub.restore();
            });
        });

        describe('post', () => {
            it('should call getBuilder with correct arguments', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder');
                instance.post('test-url');
                expect(getBuilderStub.calledOnceWith('post', 'test-url')).to.be.true;
                getBuilderStub.restore();
            });
        });

        describe('put', () => {
            it('should call getBuilder with correct arguments', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder');
                instance.put('test-url');
                expect(getBuilderStub.calledOnceWith('put', 'test-url')).to.be.true;
                getBuilderStub.restore();
            });
        });

        describe('delete', () => {
            it('should call getBuilder with correct arguments', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder');
                instance.delete('test-url');
                expect(getBuilderStub.calledOnceWith('delete', 'test-url')).to.be.true;
                getBuilderStub.restore();
            });
        });

        describe('edge cases', () => {
            it('should handle empty urlOrName without throwing errors in get method', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder').callsFake(() => {
                });
                expect(() => instance.get()).to.not.throw();
                getBuilderStub.restore();
            });

            it('should handle empty urlOrName without throwing errors in post method', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder').callsFake(() => {
                });
                expect(() => instance.post()).to.not.throw();
                getBuilderStub.restore();
            });

            it('should handle empty urlOrName without throwing errors in put method', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder').callsFake(() => {
                });
                expect(() => instance.put()).to.not.throw();
                getBuilderStub.restore();
            });

            it('should handle empty urlOrName without throwing errors in delete method', () => {
                const getBuilderStub = sinon.stub(instance, 'getBuilder').callsFake(() => {
                });
                expect(() => instance.delete()).to.not.throw();
                getBuilderStub.restore();
            });
        });
    });


    describe('withOptions', () => {
        it('should merge existing options with new options', () => {
            const newInstance = instance.withOptions({newOption: 'value'});

            newInstance.post('api/test');

            expect(requestMock.calledWith(instance, {
                initialOption: true,
                newOption: 'value'
            })).to.be.true;
        });

        it('should not alter the original options', () => {
            const newInstance = instance.withOptions({newOption: 'value'});

            newInstance.post('api/test');

            instance.post('api/test');

            expect(requestMock.calledWith(instance, {
                initialOption: true
            })).to.be.true;
        });
    });

    describe('getBuilder', () => {
        it('should correctly build and call the request with method', () => {
            const method = 'get';
            const urlOrName = 'api/test';
            const options = {additionalOption: 'additionalValue'};
            requestMock(instance, options)[method].returns({data: 'response'});

            const result = instance.getBuilder(method, urlOrName, options);

            expect(requestMock.calledWith(instance, {
                initialOption: true,
                additionalOption: 'additionalValue'
            })).to.be.true;

            expect(requestMock(instance, options)[method].calledWith(urlOrName)).to.be.true;
            expect(result).to.eql({data: 'response'});
        });

        it('should use default url if getUrl param is not provided', () => {
            const method = 'post';
            const urlOrName = 'api/test';

            requestMock(instance, {}).post.returns({data: 'response'});

            const result = instance.getBuilder(method, urlOrName);

            expect(requestMock(instance, {}).post.calledWith(urlOrName)).to.be.true;
            expect(result).to.eql({data: 'response'});
        });
    });

    describe('edge cases', () => {
        it('should handle empty options without throwing errors', () => {
            expect(() => new ApiRequest()).to.not.throw();
            expect(() => instance.withOptions()).to.not.throw();
            expect(() => instance.getBuilder('get', 'api/test')).to.not.throw();
        });

        it('should throw an error if method is not provided', () => {
            expect(() => instance.getBuilder('', 'api/test')).to.throw();
        });

        it('should handle non-string urlOrName gracefully', () => {
            const method = 'get';
            const urlOrName = 1234; // using a number instead of string
            requestMock(instance, {}).get.returns({data: 'response'});

            const result = instance.getBuilder(method, urlOrName);

            expect(requestMock(instance, {}).get.calledWith(1234)).to.be.true;
            expect(result).to.eql({data: 'response'});
        });
    });
});