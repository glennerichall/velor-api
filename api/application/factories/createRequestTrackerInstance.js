import {RequestTracker} from "../../request/RequestTracker.mjs";
import {
    getRequestNamingStrategy,
    getRequestStore
} from "../services/apiServices.mjs";

export function createRequestTrackerInstance(services) {
    const store = getRequestStore(services);
    const namingStrategy = getRequestNamingStrategy(services);
    return new RequestTracker(store, namingStrategy);
}