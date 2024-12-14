import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {
    getRequestNamingStrategy,
    getRequestStore
} from "../application/services/services.mjs";

export class RequestTracker extends Emitter {

    #getRequestKey(request) {
        return getRequestNamingStrategy(this).getRequestKey(request);
    }

    getRequests(request) {
        let key = this.#getRequestKey(request);
        return getRequestStore(this).get(key) ?? [];
    }

    push(request) {
        let key = this.#getRequestKey(request);
        getRequestStore(this).push(key, request);
        this.emit('SENT', request);
    }

    pop(request) {
        if (!request) return;
        let key = this.#getRequestKey(request);
        let index = getRequestStore(this).findIndex(key, req => req === request);
        if (index >= 0) {
            getRequestStore(this).pop(key, index);
            this.emit('RECEIVED', request);
        }
    }
}