import { Meteor } from 'meteor/meteor'
import { AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Observable } from 'meteor/deanius:antares'
import { ViewReducer, ChatReducer } from './reducers'
import Epics from './epics'
import Types from './types'
import * as Actions from './actions'

const useDemoGame = () => {
    return { key: ['chats', 'chat:demo'] }
}

// Build up a config object, via imports
const AntaresConfig = {
    ViewReducer,
    // given a key ['chats', 'id'], which reducer do we use?
    ReducerForKey: (key) => ChatReducer,
    MetaEnhancers: [useDemoGame],
    Epics,
    Types,
    onKeyNotDefined: Meteor.bindEnvironment((key) => {
        return Chats.findOne('chat:demo')
    })
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresInit(AntaresConfig)

// expose Antares 'instance methods'
export const { announce, originate, store, subscribe } = Antares

// In 'any' agent expose a top-level Antares global for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        Observable,
        Actions
    })
    // TODO define startup code here
})
