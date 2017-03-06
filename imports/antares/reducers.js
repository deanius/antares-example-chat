import { List, fromJS } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'

const messageReducer = createReducer({
    'Message.send': (msgs, message) => {
        return msgs.push(fromJS(message))
    }
}, new List([]))

const sendersReducer = createReducer({
}, new List(['Self', 'Other 1', 'Other 2']))

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
