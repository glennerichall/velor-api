import {alwaysSendRule} from "../ops/rules.mjs";
import {getApiServicesProvider} from "../services/apiPolicies.mjs";

export const RequestRegulatorPolicy = policy => {
    const {
        getRequestTracker
    } = getApiServicesProvider(policy);

    return class RequestRegulator {

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
}

export const RequestRegulator = RequestRegulatorPolicy();