import {composeRequestTransmitter} from "./composeRequestTransmitter.mjs";

export function bindSendMethodToBuilder(invoker, builder) {
    let send = composeRequestTransmitter(invoker);
    builder.send = data => send(builder, data);
    return builder;
}