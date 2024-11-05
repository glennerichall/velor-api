import {createProxyReplaceResult} from "velor-utils/utils/proxy.mjs";

import {bindSendMethodToBuilder} from "./bindSendMethodToBuilder.mjs";

export function createApiRequester(api, invoker, options) {
    return createProxyReplaceResult(api, builder => {
        builder.options(options);
        bindSendMethodToBuilder(invoker, builder);
        return builder;
    });
}

