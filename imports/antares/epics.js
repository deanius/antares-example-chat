import Actions from './actions'

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .throttleTime(2000)
            .map(a => Actions.Activity.notifyOfTyping({
                sender: a.payload.sender
            })),

    dismissTypingV1: action$ => {
        const dismissUponMessageFromSame = notifyAction =>
            action$.ofType('Message.send')
                .filter(a => a.payload.sender === notifyAction.payload.sender)
                .mapTo({
                    type: 'Activity.notifyOfTyping',
                    payload: {
                        ...notifyAction.payload,
                        active: false
                    },
                    meta: { antares: { localOnly: true } }
                })

        return action$.ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            .mergeMap(dismissUponMessageFromSame)
    }
}
