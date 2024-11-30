import {
    s_requestNamingStrategy,
    s_requestRegulator,
    s_requestTracker,
    s_urlProvider,
} from "./apiServiceKeys.mjs";
import {RequestRegulator} from "../../request/RequestRegulator.mjs";
import {RequestNamingStrategy} from "../../request/RequestNamingStrategy.mjs";
import {RequestTracker} from "../../request/RequestTracker.mjs";
import {createApiUrlProviderInstance} from "../factories/createApiUrlProviderInstance.mjs";


export const apiFactories = {
    [s_requestRegulator]: RequestRegulator,
    [s_requestTracker]: RequestTracker,
    [s_requestNamingStrategy]: RequestNamingStrategy,
    [s_urlProvider]: createApiUrlProviderInstance,
}