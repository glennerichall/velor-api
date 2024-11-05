import {createProxyReplaceResult} from "velor-utils/utils/proxy.mjs";

import {bindSendMethodToBuilder} from "./bindSendMethodToBuilder.mjs";

export function createApiRequester(api, invoker, options) {
    return createProxyReplaceResult(api, builder => {
        builder.options(options);
        bindSendMethodToBuilder(invoker, builder);
        return builder;
    });
}

export function createApiRequesterWithRule(api, invoker, regulator, rule, options) {
    let invokerAdapter = {
        send(request) {
            return regulator.accept(request, invoker, rule);
        }
    };
    return createApiRequester(api, invokerAdapter, options);
}

