import { createReducer, combineReducers, iList, fromJS } from 'meteor/deanius:antares'

const messageReducer = createReducer({
    'Message.send': (msgs, message) => {
        return msgs.push(fromJS(message))
    }
}, new iList([]))

const sendersReducer = createReducer({
}, new iList(['Self', 'Azra', 'Bubba']))

export const ChatReducer = combineReducers({
    senders: sendersReducer,
    messages: messageReducer,
})

const activityReducer = createReducer({
    'Activity.notifyOfTyping': (state, { active, sender }) => {
        if (active) {
            return state.setIn(['isTyping', sender], active)
        }
        return state.deleteIn(['isTyping', sender])
    }
}, fromJS({ isTyping: {} }))

export const ViewReducer = combineReducers({
    viewingAs: createReducer({
        'View.selectViewer': (viewer, newViewer) => newViewer
    }, 'Self'),
    activity: activityReducer
})
