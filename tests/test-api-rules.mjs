import sinon from "sinon";

import {
    abortInflightRule,
    alwaysSendRule,
    chainRules,
    doNotThrowOnStatusRule,
    ignoreIfAlreadyInFlightRule,
    waitForPreviousToFinishRule,
    takeInFlightResultRule
} from "../api/request/rules.mjs";

import {setupTestContext} from "velor/test/setupTestContext.mjs"; // Update the path to your module

const {
    expect,
    test
} = setupTestContext()

test.describe('Rules Tests', () => {
    let invoker;

    test.beforeEach(() => {
        invoker = { send: sinon.stub().resolves() };
    });

    test.describe('ignoreIfAlreadyInFlightRule', () => {
        test('should invoke send if inFlight is empty', async () => {
            const request = {};
            const inFlight = [];
            await ignoreIfAlreadyInFlightRule(request, inFlight, invoker);
            expect(invoker.send.calledOnceWith(request)).to.be.true;
        });

        test('should not invoke send if inFlight is not empty', async () => {
            const request = {};
            const inFlight = [{ id: 1 }];
            await ignoreIfAlreadyInFlightRule(request, inFlight, invoker);
            expect(invoker.send.called).to.be.false;
        });
    });

    test.describe('doNotThrowOnStatusRule', () => {
        test('should invoke send and not throw an error', async () => {
            const request = {};
            const inFlight = [];
            const rule = doNotThrowOnStatusRule(400, 404);
            await rule(request, inFlight, invoker);
            expect(invoker.send.calledOnceWith(request)).to.be.true;
        });

        test('should return null on specified status codes', async () => {
            const request = {};
            const inFlight = [];
            invoker.send.rejects({ status: 400 });
            const rule = doNotThrowOnStatusRule(400, 404);
            const result = await rule(request, inFlight, invoker);
            expect(result).to.deep.eq({
                status: 400,
                body: undefined
            });
        });

        test('should throw an error on non-specified status codes', async () => {
            const request = {};
            const inFlight = [];
            invoker.send.rejects({ status: 500 });
            const rule = doNotThrowOnStatusRule(400, 404);
            try {
                await rule(request, inFlight, invoker);
                expect.fail('Expected to throw');
            } catch (e) {
                expect(e.status).to.equal(500);
            }
        });
    });

    test.describe('abortInflightRule', () => {
        test('should abort all inFlight requests and invoke send', async () => {
            const request = {};
            const inFlight = [{ abort: sinon.stub().resolves() }, { abort: sinon.stub().resolves() }];
            await abortInflightRule(request, inFlight, invoker);
            expect(inFlight[0].abort.calledOnce).to.be.true;
            expect(inFlight[1].abort.calledOnce).to.be.true;
            expect(invoker.send.calledOnceWith(request)).to.be.true;
        });
    });

    test.describe('alwaysSendRule', () => {
        test('should always invoke send', async () => {
            const request = {};
            const inFlight = [];
            await alwaysSendRule(request, inFlight, invoker);
            expect(invoker.send.calledOnceWith(request)).to.be.true;
        });
    });

    test.describe('waitForPreviousToFinishRule', () => {
        test('should wait for all inFlight requests to finish before invoking send', async () => {
            const request = {};

            // Create promises that will resolve later
            let resolvePromise1, resolvePromise2;
            const promise1 = new Promise((resolve) => { resolvePromise1 = resolve; });
            const promise2 = new Promise((resolve) => { resolvePromise2 = resolve; });

            const inFlight = [
                { promise: promise1 },
                { promise: promise2 },
            ];

            // Create a promise for the rule execution so we can control its flow
            const ruleExecution = waitForPreviousToFinishRule(request, inFlight, invoker);

            // At this point, invoker.send should not have been called yet
            expect(invoker.send.called).to.be.false;

            // Resolve the first promise
            resolvePromise1();
            // Still, invoker.send should not have been called because the second promise is pending
            await Promise.resolve(); // Allows promise resolution to happen
            expect(invoker.send.called).to.be.false;

            // Now resolve the second promise
            resolvePromise2();
            await ruleExecution; // Wait for the rule execution to complete

            // Now invoker.send should have been called
            expect(invoker.send.calledOnceWith(request)).to.be.true;
        });
    });


    test.describe('chainRules', () => {
        test('should chain multiple rules together, invoke them sequentially, and return the invoker result', async () => {
            const request = { id: 1 };
            const inFlight = [{ id: 'inFlight1' }, { id: 'inFlight2' }];
            const invokerResult = { success: true };

            // Stub the invoker's send method to return a result
            invoker.send = sinon.stub().resolves(invokerResult);

            // Create two rules that call the next function
            const rule1 = sinon.stub().callsFake((req, inflight, next) => next.send(req));
            const rule2 = sinon.stub().callsFake((req, inflight, next) => next.send(req));

            // Chain the rules
            const chained = chainRules(rule1, rule2);

            // Invoke the chain and capture the result
            const result = await chained(request, inFlight, invoker);

            // Verify that both rules were called exactly once
            expect(rule1.calledOnce).to.be.true;
            expect(rule2.calledOnce).to.be.true;

            // Check that each rule received the correct arguments
            expect(rule1.calledWithExactly(request, inFlight, sinon.match.object)).to.be.true;
            expect(rule2.calledWithExactly(request, inFlight, sinon.match.object)).to.be.true;

            // Check that invoker.send was called with the correct request
            expect(invoker.send.calledOnceWithExactly(request)).to.be.true;

            // Verify that the final result is the one returned from invoker.send
            expect(result).to.deep.equal(invokerResult);

            // Ensure that the result returned by the chain matches the expected invoker result
            expect(result).to.equal(invokerResult);
        });


        test('should stop the chain if a rule does not call next', async () => {
            const request = {};
            const inFlight = [];

            const rule1 = sinon.stub().callsFake((req, inFlight, next) => { /* no next call */ });
            const rule2 = sinon.stub().resolves();

            const chained = chainRules(rule1, rule2);
            await chained(request, inFlight, invoker);

            expect(rule1.calledOnce).to.be.true;
            expect(rule2.called).to.be.false;
            expect(invoker.send.called).to.be.false;
        });
    });

    test.describe('takeInFlightResultRule', () => {
        let invoker;

        test.beforeEach(() => {
            invoker = { send: sinon.stub().resolves() };
        });

        test('should send the request via invoker if inFlight is empty', async () => {
            const request = { id: 1 };
            const inFlight = [];

            // Stub invoker to return a specific result when sending the request
            const invokerResult = { success: true };
            invoker.send.resolves(invokerResult);

            // Call the rule
            const result = await takeInFlightResultRule(request, inFlight, invoker);

            // Verify invoker.send is called with the correct request
            expect(invoker.send.calledOnceWithExactly(request)).to.be.true;

            // Verify the result is the invoker's result
            expect(result).to.equal(invokerResult);
        });

        test('should return the result of any in-flight promise if inFlight is not empty', async () => {
            const request = { id: 2 };

            // Create in-flight requests with promises
            let resolvePromise1, resolvePromise2;
            const inFlight = [
                { promise: new Promise((resolve) => { resolvePromise1 = resolve; }) },
                { promise: new Promise((resolve) => { resolvePromise2 = resolve; }) }
            ];

            const inFlightResult = { result: 'fromInFlight' };

            // Resolve one of the in-flight promises
            resolvePromise1(inFlightResult);

            // Call the rule
            const result = await takeInFlightResultRule(request, inFlight, invoker);

            // Verify invoker.send was not called
            expect(invoker.send.notCalled).to.be.true;

            // Verify the result is the resolved in-flight promise
            expect(result).to.equal(inFlightResult);
        });

        test('should handle rejection of some in-flight promises and return the first successful one', async () => {
            const request = { id: 3 };

            // Create in-flight requests with promises, one of which will reject
            let resolvePromise1, resolvePromise2;
            const inFlight = [
                { promise: new Promise((resolve, reject) => { reject('error'); }) },
                { promise: new Promise((resolve) => { resolvePromise2 = resolve; }) }
            ];

            const inFlightResult = { result: 'fromSuccessfulInFlight' };

            // Resolve the second in-flight promise after some time
            resolvePromise2(inFlightResult);

            // Call the rule
            const result = await takeInFlightResultRule(request, inFlight, invoker);

            // Verify invoker.send was not called
            expect(invoker.send.notCalled).to.be.true;

            // Verify the result is from the successfully resolved in-flight promise
            expect(result).to.equal(inFlightResult);
        });

        test('should throw if all in-flight promises reject', async () => {
            const request = { id: 4 };

            // Create in-flight requests with promises that all reject
            const inFlight = [
                { promise: Promise.reject('error1') },
                { promise: Promise.reject('error2') }
            ];

            // Call the rule and catch the error
            try {
                await takeInFlightResultRule(request, inFlight, invoker);
                expect.fail('Expected to throw');
            } catch (e) {
                // Expect a rejection with an AggregateError, since Promise.any throws when all promises fail
                expect(e).to.be.instanceOf(AggregateError);
            }

            // Verify invoker.send was not called
            expect(invoker.send.notCalled).to.be.true;
        });
    });

});
