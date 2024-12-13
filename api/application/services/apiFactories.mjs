import {
    s_api,
    s_requestBuilder,
    s_requestInvoker,
    s_requestNamingStrategy,
    s_requestRegulator,
    s_requestTracker,
    s_urlProvider,
} from "./apiServiceKeys.mjs";
import {RequestRegulator} from "../../request/RequestRegulator.mjs";
import {RequestNamingStrategy} from "../../request/RequestNamingStrategy.mjs";
import {RequestTracker} from "../../request/RequestTracker.mjs";
import {createApiUrlProviderInstance} from "../factories/createApiUrlProviderInstance.mjs";
import {SCOPE_PROTOTYPE} from "velor-services/injection/ServicesContext.mjs";
import {RequestBuilder} from "../../request/RequestBuilder.mjs";
import {Api} from "../../api/Api.mjs";
import {RequestInvoker} from "../../request/RequestInvoker.mjs";


export const apiFactories = {
    [s_api]: Api,
    [s_requestInvoker]: RequestInvoker,
    [s_requestRegulator]: RequestRegulator,
    [s_requestTracker]: RequestTracker,
    [s_requestNamingStrategy]: RequestNamingStrategy,
    [s_urlProvider]: createApiUrlProviderInstance,
    [s_requestBuilder]: {
        scope: SCOPE_PROTOTYPE,
        clazz: RequestBuilder
    },
}