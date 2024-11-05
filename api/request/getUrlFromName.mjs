import {
    buildUrl,
    isValidURL
} from "velor-utils/utils/urls.mjs";

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
