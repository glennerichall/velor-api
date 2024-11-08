import {composeRetryUntil} from "velor-utils/utils/functional.mjs";

export const retryRule = n => composeRetryUntil(
    alwaysSendRule,
    {
        retry: n
    });

export const ignoreIfAlreadyInFlightRule = async (request, inFLight, invoker) => {
    if (inFLight.length === 0) {
        return invoker.send(request);
    }
}

export const takeInFlightResultRule = async (request, inFlight, invoker) => {
    if (inFlight.length === 0) {
        return invoker.send(request);
    } else {
        return Promise.any(inFlight.map(request => request.promise));
    }
}

export const doNotThrowOnStatusRule = (...status) => async (request, inFLight, invoker) => {
    try {
        return await invoker.send(request);
    } catch (e) {
        if (status.includes(e.status)) {
            return {
                status: e.status,
                body: e.error,
            };
        } else {
            throw e;
        }
    }
}

export const abortInflightRule = async (request, inFlight, invoker) => {
    await Promise.all(inFlight.map(request => request.abort()));
    return invoker.send(request);
}

export const alwaysSendRule = async (request, inFlight, invoker) => {
    return invoker.send(request);
}

export const waitForPreviousToFinishRule = async (request, inFlight, invoker) => {
    await Promise.all(inFlight.map(request => request.promise));
    return invoker.send(request);
}

export const chainRules = (...rules) => {
    return async (request, inFlight, invoker) => {
        const createNextInvoker = (i) => {
            if (i >= rules.length) {
                return invoker; // Return the invoker's send method at the end
            }

            return {
                async send(req) {
                    const nextInvoker = createNextInvoker(i + 1); // Create the next rule in the chain
                    return await rules[i](req, inFlight, nextInvoker); // Return the result of each rule
                }
            };
        };

        const firstRule = createNextInvoker(0);
        return await firstRule.send(request); // Ensure the chain returns the result of the invoker
    };
};
