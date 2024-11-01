// fetch api from browser or AxiosFetcher from test stubs
export async function getDataFromXhrResponse (response) {
    response = await response;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return response.body;
    }
    try {
        return response.json();
    } catch (e) {
        return response.body;
    }
}