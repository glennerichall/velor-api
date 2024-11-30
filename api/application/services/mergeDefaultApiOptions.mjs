import {apiFactories} from "./apiFactories.mjs";

export function mergeDefaultApiOptions(options = {}) {

    const {
        factories = {}
    } = options;

    return {
        ...options,
        factories: {
            ...apiFactories,
            ...factories
        }
    };
}