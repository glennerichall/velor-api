import {
    PolicyBasedRuleBuilder,
    RuleBuilder
} from "../api/request/RuleBuilder.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from "sinon";
import {alwaysSendRule} from "../api/request/rules.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('PolicyBasedRuleBuilder', () => {
    const mockDefaultRule = sinon.fake();
    const mockChainRules = sinon.fake((rule1, rule2) => rule2);
    const mockDoNotThrowOnStatusRule = sinon.fake(() => "mock-do-not-throw");
    const mockRetryRule = sinon.fake(() => "mock-retry");

    const TestBuilder = PolicyBasedRuleBuilder(
        mockDefaultRule,
        mockDoNotThrowOnStatusRule,
        mockRetryRule,
        mockChainRules);

    test('new RuleBuilder has alwaysSendRule as default rule', () => {
        const builder = new RuleBuilder();
        expect(builder.build()).to.equal(alwaysSendRule);
    });

    test('new TestBuilder has mockDefaultRule as default rule', () => {
        const builder = new TestBuilder();
        expect(builder.build()).to.equal(mockDefaultRule);
    });

    test('TestBuilder correctly appends rules', () => {
        const builder = new TestBuilder().append("testRule");
        expect(builder.build()).to.equal("testRule");
    });

    test('TestBuilder correctly appends multiple rules', () => {
        const builder = new TestBuilder()
            .append("testRule")
            .append("testRule2");

        expect(builder.build()).to.equal("testRule2");
        expect(mockChainRules.calledWith("testRule", "testRule2")).to.be.true;
    });

    test('doNotFailFor function correctly uses all codes', () => {
        const builder = new TestBuilder().doNotFailFor(500, 400);

        expect(builder.build()).to.equal("mock-do-not-throw");
        expect(mockDoNotThrowOnStatusRule.calledOnceWith(500, 400)).to.be.true;
    });

    test('doNotFailFor function correctly appends rule in TestBuilder', () => {
        const builder = new TestBuilder().doNotFailFor(500);

        expect(builder.build()).to.equal("mock-do-not-throw");
        expect(mockDoNotThrowOnStatusRule.calledOnceWith(500)).to.be.true;
    });

    test('retry function correctly appends rule in TestBuilder', () => {
        const builder = new TestBuilder().retry(3);

        expect(builder.build()).to.equal("mock-retry");
        expect(mockRetryRule.calledOnceWith(3)).to.be.true;
    });
});