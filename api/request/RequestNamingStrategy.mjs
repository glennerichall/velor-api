import {expressRouteToRegExp} from "velor-utils/utils/expressRouteToRegExp.mjs";
import {getApiUrlProvider} from "../application/services/services.mjs";

export class RequestNamingStrategy {

    findRequestNameInUrls(request) {
        let urls = getApiUrlProvider(this).urls;
        let url = request.url.split('?')[0];
        for (let urlName in urls) {
            let regexp = expressRouteToRegExp(urls[urlName]);
            let match = url.match(regexp);
            if (match) {
                return {
                    name: urlName,
                    params: match.groups
                };
            }
        }
    }

    getRequestName(request) {
        if (!request) return null;

        // first find the name of the request as named in backend
        if (!request.name) {
            let match = this.findRequestNameInUrls(request);

            // if the name was found, find the mapping between the urls
            // and the state name in the store
            if (match) {
                request.name = match.name;
                if (!request.params) {
                    request.params = match.params;
                }
            }
        }

        // if none was found, let the name of the request be its url
        if (!request.name) {
            request.name = request.url.split('?')[0];
        }

        return request.name;
    }

    getRequestKey(request) {
        let name = this.getRequestName(request);
        return request.options.method + ':' + name;
    }
}