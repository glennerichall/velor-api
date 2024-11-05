export class RequestTransmitter {
    async send(data, builder, invoker) {
        builder.set('X-Requested-With', 'XMLHttpRequest');
        if (data) {
            builder.setContent(data);
        }
        let request = builder.getRequest();
        return invoker.send(request);
    }
}