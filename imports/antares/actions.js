// Antares.store is special kind of action that informs
// agents to store something. If a key or keyPath isn't
// given, the newId function is used to create a key
export const Chat = {
    start: () => ({
        type: 'Antares.store',
        payload: {
            senders: ['Self', 'Other 1', 'Other 2'],
            messages: [{
                message: 'Hello',
                sentAt: new Date(),
                sender: 'Other 1'
            }]
        }
    })
}

// In regular actions, meta.antares.key is used to specify
// which part of the store the reducer is to be invoked upon
export const Message = {
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

export const View = {
    selectViewer: (viewer) => ({
        type: 'View.selectViewer',
        payload: viewer,
        meta: { antares: { localOnly: true } }
    })
}

export const Activity = {
    type: ({ sender }) => ({
        type: 'Activity.type',
        payload: { sender },
        meta: { antares: { localOnly: true } }
    }),
    notifyOfTyping: ({ sender, active=true }) => ({
        type: 'Activity.notifyOfTyping',
        payload: { active, sender }
    })
}
