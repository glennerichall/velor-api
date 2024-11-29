import {MessageCoderV1} from "velor-messaging/messaging/message/MessageCoderV1.mjs";

export function createMessageCoderInstance(services) {
    return new MessageCoderV1();
}