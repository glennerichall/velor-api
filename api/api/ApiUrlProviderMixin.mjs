import {
    buildUrl,
    isValidURL
} from "velor/utils/urls.mjs";
import {getApi} from "../services/apiServices.mjs";

function getUrlFromName(urlProvider, urlBuilder) {
    let urlOrName = urlBuilder.getUrl();
    if (!isValidURL(urlOrName)) {
        let urls = urlProvider.getUrls();
        if (urls) {
            urlOrName = urls[urlOrName];
        }
    }
    return buildUrl(
        urlOrName,
        urlBuilder.getParams(),
        urlBuilder.getQuery()
    );
}

export const ApiUrlProviderMixin = UrlProviderClass => class extends UrlProviderClass {

    constructor(...args) {
        super(...args);
    }

    buildUrl() {
        let urlProvider = getApi(this);
        return getUrlFromName(urlProvider, this);
    }
}