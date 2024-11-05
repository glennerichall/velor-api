import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect,
    test,
    it,
    describe,
    beforeEach
} = setupTestContext();

import sinon from 'sinon';
import {RequestNamingStrategy} from "../api/request/RequestNamingStrategy.mjs";

describe('RequestNamingStrategy', () => {
    let urlProviderMock;
    let requestNamingStrategy;

    beforeEach(() => {
        urlProviderMock = {
            getUrls: sinon.stub()
        };
        requestNamingStrategy = new RequestNamingStrategy(urlProviderMock);
    });

    describe('findRequestNameInUrls', () => {
        it('should return the matching name and params when URL matches', () => {
            const urls = {
                home: '/home',
                user: '/user/:id'
            };
            urlProviderMock.getUrls.returns(urls);
            const request = {
                url: '/user/1234'
            };
            const result = requestNamingStrategy.findRequestNameInUrls(request);
            expect(result).to.deep.equal({
                name: 'user',
                params: {id: '1234'}
            });
        });

        it('should return undefined when no URL matches', () => {
            const urls = {
                home: '/home',
                user: '/user/:id'
            };
            urlProviderMock.getUrls.returns(urls);
            const request = {
                url: '/profile'
            };
            const result = requestNamingStrategy.findRequestNameInUrls(request);
            expect(result).to.be.undefined;
        });
    });

    describe('getRequestName', () => {
        it('should return null when request is null', () => {
            const result = requestNamingStrategy.getRequestName(null);
            expect(result).to.be.null;
        });

        it('should return the name from request when already provided', () => {
            const request = {
                name: 'home',
                url: '/home'
            };
            const result = requestNamingStrategy.getRequestName(request);
            expect(result).to.equal('home');
        });

        it('should set and return the name from URL match', () => {
            const urls = {
                home: '/home',
                user: '/user/:id'
            };
            urlProviderMock.getUrls.returns(urls);
            const request = {
                url: '/user/1234'
            };
            const result = requestNamingStrategy.getRequestName(request);
            expect(result).to.equal('user');
            expect(request).to.deep.include({
                name: 'user',
                params: {id: '1234'}
            });
        });

        it('should set and return the URL as name when no match found', () => {
            const urls = {
                home: '/home',
                user: '/user/:id'
            };
            urlProviderMock.getUrls.returns(urls);
            const request = {
                url: '/profile'
            };
            const result = requestNamingStrategy.getRequestName(request);
            expect(result).to.equal('/profile');
        });
    });

    describe('getRequestKey', () => {
        it('should return the composed request key', () => {
            const urls = {
                home: '/home',
                user: '/user/:id'
            };
            urlProviderMock.getUrls.returns(urls);
            const request = {
                url: '/user/1234',
                options: {
                    method: 'GET'
                }
            };
            const result = requestNamingStrategy.getRequestKey(request);
            expect(result).to.equal('GET:user');
        });
    });
});