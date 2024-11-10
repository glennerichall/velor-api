import {alwaysSendRule} from "../ops/rules.mjs";
import {getRequestTracker} from "../services/apiServices.mjs";

export class RequestRegulator {

    async accept(request, invoker, rule = alwaysSendRule) {
        let tracker = getRequestTracker(this);
        let requests = tracker.getRequests(request);

        tracker.push(request);
        try {
            return await rule(request, requests, invoker);
        } finally {
            tracker.pop(request);
        }
    }
}