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