export function composeSendRequest(invoker) {
    return (builder, data) => {
        builder.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            builder.setContent(data);
        }
        let request = builder.getRequest();
        return invoker.send(request);
    };
}