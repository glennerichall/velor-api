import {Emitter} from "velor/utils/Emitter.mjs";

export class RequestTracker extends Emitter {
    #store;
    #requestNaming;

    constructor(store, namingStrategy) {
        super();
        this.#store = store;
        this.#requestNaming = namingStrategy;
    }

    get currentRequests() {
        return this.#store.getRequests();
    }

    #mergeRequests(key, ...newRequests) {
        let currentRequests = this.currentRequests;
        currentRequests = {
            ...currentRequests,
            [key]: newRequests
        };
        this.#store.setRequests(currentRequests);
    }

    #getRequestKey(request) {
        return this.#requestNaming.getRequestKey(request);
    }

    getRequests(request) {
        let key = this.#getRequestKey(request);
        return this.currentRequests[key] ?? [];
    }

    push(request) {
        let key = this.#getRequestKey(request);
        const currentRequestsForKey = this.currentRequests[key] ?? [];
        this.#mergeRequests(key, request, ...currentRequestsForKey);
        this.emit(key, 'SENT', request);
    }

    pop(request) {
        if (!request) return;
        let key = this.#getRequestKey(request);
        let currentRequests = this.currentRequests;

        let current = currentRequests[key] ?? [];
        const currentRequestsForKey = [...current];

        // find position of request and remove it from current in flight requests if found
        const pos = currentRequestsForKey.indexOf(request);
        if (pos >= 0) {
            currentRequestsForKey.splice(pos, 1);
            this.#mergeRequests(key, ...currentRequestsForKey);
            this.emit(key, 'RECEIVED', request);
        }
    }
}