export default {
    Chat: {
        start: () => ({
            type: 'Antares.store',
            payload: {
                senders: ['Self', 'Other 1', 'Other 2']
            }
        })
    },
    Message: {
        send: ({ message, sender }) => ({
            type: 'Message.send',
            payload: {
                message,
                sender,
                // Since the user cares about sentAt it's payload, not simply metadata
                sentAt: new Date()
            }
        })
    }
}
