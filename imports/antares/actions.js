export default {
    Activity: {
        type: ({ sender }) => ({
            type: 'Activity.type',
            payload: { sender },
            meta: { antares: { localOnly: true } }
        }),
        notifyOfTyping: ({ sender, active=true }) => ({
            type: 'Activity.notifyOfTyping',
            payload: { active, sender }
        })
    },
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
        }),
        markError: ({ message, sender }) => ({
            type: 'Message.markError',
            payload: { 
                message,
                sender
            }
        })
    },
    View: {
        selectViewer: (viewer) => ({
            type: 'View.selectViewer',
            payload: viewer,
            meta: { antares: { localOnly: true } }
        })
    }    
}
