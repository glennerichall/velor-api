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
            .query(query);
}

export function composeGetMany(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, query) =>
        request(services)
            .get(urlProvider.getUrl(resource))
            .query(query);
}

export function composeDelete(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource, item) =>
        request(services)
            .delete(urlProvider.getUrl(getItemUrlName(resource)))
            .param(ITEM_PARAM, item);
}

export function composeCreate(services, request) {
    let urlProvider = getApiUrlProvider(services);
    return (resource) =>
        request(services)
            .post(urlProvider.getUrl(resource));
}

export function createResourceApiWithRuleComposers(rule = alwaysSendRule) {
    let requester = services => requestWithRule(services, rule);
    return createResourceApiComposers(requester);
}

export function getResourceApi(services) {

    function compose(name, composers) {
        const {
            composeGetOne,
            composeGetMany,
            composeDelete,
            composeCreate,
        } = composers;

        let getOne = composeGetOne(services),
            getMany = composeGetMany(services),
            deleteOne = composeDelete(services),
            create = composeCreate(services);

        return {
            getOne: (item, query) => getOne(name, item, query),
            getMany: (query) => getMany(name, query),
            delete: (item) => deleteOne(name, item),
            create: () => create(name),
        };
    }

    return {
        for(name) {
            return {
                withRule(rule) {
                    return compose(name, createResourceApiWithRuleComposers(rule))
                },
                ...compose(name, createResourceApiComposers())
            }
        }
    }
}

export function createResourceApiComposers(requester = request) {
    return {
        composeGetOne: services => composeGetOne(services, requester),
        composeGetMany: services => composeGetMany(services, requester),
        composeDelete: services => composeDelete(services, requester),
        composeCreate: services => composeCreate(services, requester),
    };
}
