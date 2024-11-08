import {getApiOpsProvider} from "../services/apiPolicies.mjs";

export const ResponseWrapperPolicy = policy => {
    const {
        getDataFromResponse
    } = getApiOpsProvider(policy);

    return class {
        #response;
        #data;

        constructor(response) {
            this.#response = response;
        }

        get headers() {
            return this.#response.headers;
        }

        get ok() {
            return this.#response.ok;
        }

        get status() {
            return this.#response.status;
        }

        get body() {
            return this.unpack();
        }

        async unpack() {
            if (!this.#data) {
                this.#data = getDataFromResponse(this.#response);
            }
            return this.#data;
        }

        async json() {
            return this.unpack();
        }
    }
}

export const ResponseWrapper = ResponseWrapperPolicy();