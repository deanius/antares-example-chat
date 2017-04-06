import { createReducer, combineReducers } from 'meteor/deanius:antares'

export const ViewReducer = combineReducers({
    viewingAs: createReducer({
        'View.selectViewer': (viewer, newViewer) => newViewer
    }, 'Self')
})
