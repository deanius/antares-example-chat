import Actions from './actions'
import { Observable } from 'meteor/deanius:antares'

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .throttleTime(1000)
            .map(a => Actions.Activity.notifyOfTyping({
                sender: a.payload.sender
            })),

    dismissTypingV1: action$ => {
        // Creates an action that cancels typingIndication for that sender,
        //  but is not broadcast to other nodes
        const createCancelActionFor = typingSender => ({
            type: 'Activity.notifyOfTyping',
            payload: {
                sender: typingSender,
                active: false
            },
            meta: { antares: { localOnly: true } }
        })

        // Given a senders Id, returns an Observable of cancellations
        //  triggered by a received message from that same sender
        const dismissUponMessageFrom = typingSender =>
            action$.ofType('Message.send')
                .filter(newMsgAction => newMsgAction.payload.sender === typingSender)
                .mapTo(createCancelActionFor(typingSender))

        // Given a senders Id, returns an observable that in 2500 msec
        //   emits an action to turn the indicator off for that sender
        const timeoutIndicator = typingSender =>
            Observable.timer(2500)
                .mapTo(createCancelActionFor(typingSender))

        return action$.ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            .switchMap(notifyAction =>
                Observable.race(
                    dismissUponMessageFrom(notifyAction.payload.sender),
                    timeoutIndicator(notifyAction.payload.sender)
                )
            )
    }
}
