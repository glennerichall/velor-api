import {createProxyReplaceResult} from "velor-utils/utils/proxy.mjs";

import {composeSendRequest} from "./composeSendRequest.mjs";

export function createApiWithSendMethod(api, invoker, options) {
    return createProxyReplaceResult(api, builder => {
        builder.options(options);
        let send = composeSendRequest(invoker);
        builder.send = data => send(builder, data);
        return builder;
    });
}

