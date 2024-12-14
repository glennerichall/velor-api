import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {getProvider} from "velor-services/application/services/baseServices.mjs";

import {s_messageCoder} from "../services/serviceKeys.mjs";

export function createMessageBuilderInstance(services) {
    const provider = getProvider(services);
    const coder = provider[s_messageCoder]();
    return new MessageBuilder(coder);
}