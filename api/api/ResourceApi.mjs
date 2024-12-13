import {requestWithRule} from "../composers/requestWithRule.mjs";
import {alwaysSendRule} from "../ops/rules.mjs";
import {getApiUrlProvider} from "../application/services/apiServices.mjs";
import {request} from "../composers/request.mjs";

export const ONE_NAME_SUFFIX = "_ITEM";
export const ITEM_PARAM = "item";

export function getItemUrlName(collectionUrlName) {
    return collectionUrlName + ONE_NAME_SUFFIX;
}

export function composeGetOne(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, item, query = {}) =>
        request(services)
            .get(urlProvider.getUrl(getItemUrlName(resource)))
            .param(ITEM_PARAM, item)
            .query(query)
            .send();
}

export function composeGetMany(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, query) =>
        request(services)
            .get(urlProvider.getUrl(resource))
            .query(query)
            .send();
}

export function composeDelete(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, item) =>
        request(services)
            .delete(urlProvider.getUrl(getItemUrlName(resource)))
            .param(ITEM_PARAM, item)
            .send();
}

export function composeCreate(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, data) =>
        request(services)
            .post(urlProvider.getUrl(resource))
            .send(data);
}

export function createResourceApiWithRuleComposer(rule = alwaysSendRule) {
    let requester = services => requestWithRule(services, rule);
    return createResourceApiComposer(requester);
}

export function createResourceApiComposer(requester = request) {
    return {
        composeGetOne: services => composeGetOne(services, requester),
        composeGetMany: services => composeGetMany(services, requester),
        composeDelete: services => composeDelete(services, requester),
        composeCreate: services => composeCreate(services, requester),
    };
}
