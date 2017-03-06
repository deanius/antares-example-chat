import { originate } from './main'
import Actions from './actions'
import Rx from 'rxjs'

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .throttleTime(1000)
            .map(a =>
                originate(Actions.Activity.notifyOfTyping, {
                    sender: a.payload.sender
                })),
    
    removeTypingNotification: action$ =>
        action$.ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            .mergeMap(notificationOnAction =>
                Rx.Observable.timer(2500)
                    .map(() => ({
                        type: 'Activity.notifyOfTyping',
                        payload: {
                            active: false,
                            sender: notificationOnAction.payload.sender
                        },
                        meta: {
                            antares: {
                                localOnly: false
                            }
                        }
                    })))
}
