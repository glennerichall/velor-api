import {
    s_requestRegulator,
    s_requestTracker,
    s_requestTransmitter
} from "./apiServiceKeys.mjs";
import {RequestRegulator} from "../../request/RequestRegulator.mjs";
import {createRequestTrackerInstance} from "../factories/createRequestTrackerInstance.js";
import {RequestNamingStrategy} from "../../request/RequestNamingStrategy.mjs";


export const apiFactories = {
    [s_requestRegulator]: RequestRegulator,
    [s_requestTracker]: createRequestTrackerInstance,
    [s_requestTransmitter]: RequestNamingStrategy,
}