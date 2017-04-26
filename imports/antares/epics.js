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

export default {}