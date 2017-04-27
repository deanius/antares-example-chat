import Actions from './actions'
import { Observable } from 'meteor/deanius:antares'

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

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .throttleTime(1000)
            .map(triggerAction => Actions.Activity.notifyOfTyping({
                sender: triggerAction.payload.sender,
                active: true
            })),
    dismissTypingIndicator: action$ => {
        const dismissMessageFrom = (sender) =>
            action$.ofType('Message.send')
                .filter(action => action.payload.sender === sender)
                .mapTo(createCancelActionFor(sender))

        const timeoutIndicator = (sender) =>
            Observable.timer(2500)
                .mapTo(createCancelActionFor(sender))

        return action$.ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            .switchMap(triggerAction =>
                Observable.race(
                    dismissMessageFrom(triggerAction.payload.sender),
                    timeoutIndicator(triggerAction.payload.sender)
                )
            )
    }
}