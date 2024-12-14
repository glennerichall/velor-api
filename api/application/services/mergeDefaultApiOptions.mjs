import {factories as defaultFactories} from "./factories.mjs";

export function mergeDefaultApiOptions(options = {}) {

    const {
        factories = {}
    } = options;

    return {
        ...options,
        factories: {
            ...defaultFactories,
            ...factories
        }
    };
}