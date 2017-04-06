import { createReducer, combineReducers, iList, fromJS } from 'meteor/deanius:antares'

const messageReducer = createReducer({
    'Message.send': (msgs, message) => {
        return msgs.push(fromJS(message))
    }
}, new iList([]))

const sendersReducer = createReducer({
}, new iList(['Self', 'Other 1', 'Other 2']))

export const ChatReducer = combineReducers({
    senders: sendersReducer,
    messages: messageReducer,
})

export const ViewReducer = combineReducers({
    viewingAs: createReducer({
        'View.selectViewer': (viewer, newViewer) => newViewer
    }, 'Self')
})
