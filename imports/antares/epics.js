import { originate } from './main'
import Actions from './actions'

export default {
    notifyOfTyping: action$ =>
        action$.ofType('Activity.type')
            .map(a =>
                originate(Actions.Activity.notifyOfTyping, {
                    sender: a.payload.sender
                }))
}
