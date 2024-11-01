function toString(urlOrRequest) {
    if (typeof urlOrRequest === "string") {
        return urlOrRequest;
    }
    return urlOrRequest?.url;
}

export class BackendError extends Error {
    constructor(status, message, urlOrRequest) {
        super(`${status} : ${message} [from ${toString(urlOrRequest)}]`);
        this.status = status;
        this.error = message;
        this.name = 'BackendError';
        this.url = urlOrRequest;
    }
}