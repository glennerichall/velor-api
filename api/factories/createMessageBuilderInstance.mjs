import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {getProvider} from "velor-services/injection/baseServices.mjs";

import {s_messageCoder} from "../services/apiServiceKeys.mjs";

export function createMessageBuilderInstance(services) {
    const provider = getProvider(services);
    const coder = provider[s_messageCoder]();
    return new MessageBuilder(coder);
}