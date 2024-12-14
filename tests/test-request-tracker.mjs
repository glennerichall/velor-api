import sinon from 'sinon';
import {RequestTracker} from "../api/request/RequestTracker.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";
import {
    s_requestNamingStrategy,
    s_requestStore
} from "../api/application/services/serviceKeys.mjs";
import {MapArray} from "velor-utils/utils/map.mjs";
import {getRequestStore} from "../api/application/services/services.mjs";


const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext();

describe('RequestTracker', () => {
    let tracker, namingStrategy;

    beforeEach(() => {
        tracker = new RequestTracker();
        namingStrategy = {
            getRequestKey: sinon.stub()
        };

        getInstanceBinder(tracker)
            .setInstance(s_requestNamingStrategy, namingStrategy)
            .setInstance(s_requestStore, new MapArray());
    })

    describe('#getRequests()', () => {
        it('should get all requests of a specific key', () => {
            let requestKey = 'GET:url1';
            getRequestStore(tracker).push(requestKey, 'req1', 'req2')

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
            namingStrategy.getRequestKey.returns(requestKey);
            tracker.push(request);
            expect(getRequestStore(tracker).get(requestKey)).to.have.length(1);
        });
    });

    describe('#pop()', () => {
        it('should remove request from the specific key and emit an event', () => {
            let requestKey = 'GET:url1';
            getRequestStore(tracker).push(requestKey, 'req1', 'req2');

            namingStrategy.getRequestKey.returns(requestKey)

            let request = 'req1';

            tracker.pop(request);

            expect(getRequestStore(tracker).get(requestKey)).to.have.length(1);
        });
    });
});