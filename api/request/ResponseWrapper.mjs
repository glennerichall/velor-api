import {getDataFromResponse} from "../ops/getDataFromResponse.mjs";

const kp_response = Symbol("response");
const kp_data = Symbol("data");

export class ResponseWrapper {


    constructor(response) {
        this[kp_response] = response;
    }

    get headers() {
        return this[kp_response].headers;
    }

    get ok() {
        return this[kp_response].ok;
    }

    get status() {
        return this[kp_response].status;
    }

    get body() {
        return this.unpack();
    }

    async unpack() {
        if (!this[kp_data]) {
            this[kp_data] = getDataFromResponse(this[kp_response]);
        }
        return this[kp_data];
    }

    async json() {
        return this.unpack();
    }
}