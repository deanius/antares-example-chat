import { originate } from './main'
import Actions from './actions'

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .throttleTime(2000)
            .map(a =>
                originate(Actions.Activity.notifyOfTyping, {
                    sender: a.payload.sender
                }))
}
