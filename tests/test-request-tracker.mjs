import sinon from 'sinon';
import {RequestTracker} from "../api/request/RequestTracker.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";
import {
    s_requestNamingStrategy,
    s_requestStore
} from "../api/application/services/apiServiceKeys.mjs";


const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext();

let urlProvider = {
    getUrls: () => {
        return {
            url1: '/test/:id',
            url2: '/test/:id/info'
        }
    }
}

let namingStrategy ={
    getRequestKey: sinon.stub()
}

// Assuming an existing store object
let store = {
    setRequests: sinon.spy(),
    getRequests: sinon.stub()
};

describe('RequestTracker', () => {
    let tracker;

    beforeEach(()=> {
        tracker = new RequestTracker(store, namingStrategy);
        getInstanceBinder(tracker)
            .setInstance(s_requestNamingStrategy, namingStrategy)
            .setInstance(s_requestStore, store);
    })

    describe('#currentRequests()', () => {
        it('should get all current requests from the store', () => {
            tracker.currentRequests;
            expect(store.getRequests.calledOnce).to.be.true;
        });
    });

    describe('#getRequests()', () => {
        it('should get all requests of a specific key', () => {
            let requestKey = 'GET:url1';
            store.getRequests.returns({ [requestKey]: ['req1', 'req2'] });

            let request = {
                options: {
                    method: 'GET'
                },
                name: 'url1'
            };

            namingStrategy.getRequestKey.returns(requestKey);
            let result = tracker.getRequests(request);
            expect(result).to.eql(['req1', 'req2']);
        });
    });

    describe('#push()', () => {
        it('should add new request to the specific key and emit an event', () => {
            let requestKey = 'GET:url1';

            let request = {
                options: {
                    method: 'GET'
                },
                name: 'url1'
            };
            store.getRequests.returns({ [requestKey]: ['req1', 'req2'] });
            tracker.push(request);
            expect(store.setRequests.calledOnce).to.be.true;
        });
    });

    describe('#pop()', () => {
        it('should remove request from the specific key and emit an event', () => {
            let requestKey = 'GET:url1';
            store.getRequests.returns({ [requestKey]: ['req1', 'req2'] });

            namingStrategy.getRequestKey.returns(requestKey)
            let request = 'req1';
            store.getRequests.returns({ [requestKey]: ['req1', 'req2'] });
            tracker.pop(request);

            expect(store.setRequests.calledOnce).to.be.true;
        });
    });
});