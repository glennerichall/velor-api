import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from "sinon";
import {RequestTransmitter} from "../api/request/RequestTransmitter.mjs";
import {
    createAppServicesInstance,
    getServiceBinder,
    SCOPE_PROTOTYPE
} from "velor-utils/utils/injection/ServicesContext.mjs";
import {s_api, s_requestBuilder, s_requestInvoker, s_requestTransmitter} from "../api/services/apiServiceKeys.mjs";
import {createInstance} from "velor-utils/utils/injection/createInstance.mjs";
import {Api} from "../api/api/Api.mjs";
import {RequestBuilder} from "../api/request/RequestBuilder.mjs";

const {
    expect,
    test
} = setupTestContext()


test.describe('RequestTransmitter', () => {
    let transmitter = null;
    let fakeBuilder = null;
    let fakeInvoker = null;
    let services;

    test.beforeEach(() => {
        // Set default fake values
        fakeBuilder = {
            set: sinon.fake(),
            setContent: sinon.fake(),
            getRequest: sinon.fake.returns('fakeRequest')
        };
        fakeInvoker = {send: sinon.fake.returns('response')};

        services = createAppServicesInstance(
            {
                factories: {
                    [s_requestInvoker]: () => fakeInvoker,
                }
            }
        );

        transmitter = new RequestTransmitter(fakeBuilder);
        getServiceBinder(services).autoWire(transmitter);
    });

    test.afterEach(() => {
        sinon.restore();
    });

    test("sendRequest invokes invoker's send method with given request", async () => {
        const request = 'dummyRequest';
        const response = await transmitter.sendRequest(request, fakeInvoker);

        expect(fakeInvoker.send.calledOnce).to.be.true;
        expect(fakeInvoker.send.firstCall.calledWithExactly(request)).to.be.true;
        expect(response).to.equal('response');
    });

    test('send sets up request and uses it to send message', async () => {
        const data = 'dummyData';
        const response = await transmitter.send(data);

        expect(fakeBuilder.set.calledOnce).to.be.true;
        expect(fakeBuilder.set.firstCall.calledWithExactly('X-Requested-With', 'XMLHttpRequest')).to.be.true;
        expect(fakeBuilder.setContent.calledOnce).to.be.true;
        expect(fakeBuilder.setContent.firstCall.calledWithExactly(data)).to.be.true;
        expect(fakeBuilder.getRequest.calledOnce).to.be.true;
        expect(fakeInvoker.send.calledOnce).to.be.true;
        expect(fakeInvoker.send.firstCall.calledWithExactly('fakeRequest')).to.be.true;
        expect(response).to.equal('response');
    });

    test('send sets up request without data and uses it to send message', async () => {
        const response = await transmitter.send();

        expect(fakeBuilder.set.calledOnce).to.be.true;
        expect(fakeBuilder.set.firstCall.calledWithExactly('X-Requested-With', 'XMLHttpRequest')).to.be.true;
        expect(fakeBuilder.setContent.called).to.be.false;
        expect(fakeBuilder.getRequest.calledOnce).to.be.true;
        expect(fakeInvoker.send.calledOnce).to.be.true;
        expect(fakeInvoker.send.firstCall.calledWithExactly('fakeRequest')).to.be.true;
        expect(response).to.equal('response');
    });
});