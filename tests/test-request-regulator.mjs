import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createAppServicesInstance, getServiceBinder} from "velor-utils/utils/injection/ServicesContext.mjs";
import {s_requestTracker} from "../api/services/apiServiceKeys.mjs";
import sinon from "sinon";
import {RequestRegulator} from "../api/request/RequestRegulator.mjs";


const {
    expect,
    describe,
    it,
    beforeEach
} = setupTestContext()

describe('RequestRegulator', () => {
    let services, regulator, tracker;
    let requests = [2, 5, 8, 9];

    beforeEach(() => {
        services = createAppServicesInstance({
            factories: {
                [s_requestTracker]: () => tracker = {
                    getRequests: sinon.stub().returns(requests),
                    push: sinon.stub(),
                    pop: sinon.stub()
                }
            }
        });

        regulator = getServiceBinder(services).createInstance(RequestRegulator);
    })

    it('should let rule handle request invocation', async () => {
        let rule = sinon.stub();
        let invoker = 'invoker';
        await regulator.accept('request', invoker, rule);
        expect(rule.calledOnce).to.be.true;
        expect(rule.calledWith(
            'request', requests, invoker
        )).to.be.true;
    })

    it('should push and pop from tracker', async () => {
        let rule = sinon.stub();
        let invoker = 'invoker';
        await regulator.accept('request', invoker, rule);

        expect(tracker.push.calledOnce).to.be.true;
        expect(tracker.pop.calledOnce).to.be.true;

        expect(tracker.pop.calledWith('request')).to.be.true;
        expect(tracker.push.calledWith('request')).to.be.true;
    })

    it('should push and pop from tracker even if throws', async () => {
        let rule = sinon.stub().throws(new Error());
        let invoker = 'invoker';

        let error;
        try {
            await regulator.accept('request', invoker, rule);
            error = new Error('Should have failed');
        } catch (e) {

        }

        expect(error).to.be.undefined;

        expect(tracker.push.calledOnce).to.be.true;
        expect(tracker.pop.calledOnce).to.be.true;

        expect(tracker.pop.calledWith('request')).to.be.true;
        expect(tracker.push.calledWith('request')).to.be.true;
    })
})