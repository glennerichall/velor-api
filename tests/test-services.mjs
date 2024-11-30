import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {
    createAppServicesInstance,
    getServiceBuilder
} from "velor-services/injection/ServicesContext.mjs";
import {mergeDefaultApiOptions} from "../api/application/services/mergeDefaultApiOptions.mjs";
import {
    getApiUrlProvider,
    getFetch,
    getRequestNamingStrategy,
    getRequestRegulator,
    getRequestTracker
} from "../api/application/services/apiServices.mjs";
import {RequestRegulator} from "../api/request/RequestRegulator.mjs";
import {RequestTracker} from "../api/request/RequestTracker.mjs";
import {RequestNamingStrategy} from "../api/request/RequestNamingStrategy.mjs";
import {ApiUrlProvider} from "../api/api/ApiUrlProvider.mjs";
import {
    BACKEND_HOST_URL,
    BACKEND_VERSION_URLS
} from "../api/application/services/apiEnvKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe("application services", () => {
    let services;

    beforeEach(()=> {
        services = createAppServicesInstance(
            mergeDefaultApiOptions()
        );
    })

    it('should not have fetch', ()=> {
        expect(()=> getFetch(services)).to.throw(Error, /Provide a factory or a class for "fetch"/);
    })

    it('should have RequestRegulator', ()=> {
        expect(getRequestRegulator(services)).to.be.an.instanceof(RequestRegulator);
    })

    it('should have RequestTracker', ()=> {
        expect(getRequestTracker(services)).to.be.an.instanceof(RequestTracker);
    })

    it('should have RequestNamingStrategy', ()=> {
        expect(getRequestNamingStrategy(services)).to.be.an.instanceof(RequestNamingStrategy);
    })

    it('should have ApiUrlProvider', ()=> {
        getServiceBuilder(services).addEnv(BACKEND_HOST_URL, 'http://localhost:3000')
        expect(getApiUrlProvider(services)).to.be.an.instanceof(ApiUrlProvider);
        expect(getApiUrlProvider(services).versionUrl).to.eq('http://localhost:3000/api/version');
    })

    it('should have ApiUrlProvider with provided path', ()=> {
        getServiceBuilder(services).addEnv(BACKEND_HOST_URL, 'http://localhost:3000');
        getServiceBuilder(services).addEnv(BACKEND_VERSION_URLS, '/urls');
        expect(getApiUrlProvider(services)).to.be.an.instanceof(ApiUrlProvider);
        expect(getApiUrlProvider(services).versionUrl).to.eq('http://localhost:3000/urls');
    })
})