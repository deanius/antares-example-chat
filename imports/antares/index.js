import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Observable } from 'meteor/deanius:antares'
import { ViewReducer, ChatReducer } from './reducers'
import Epics from './epics'
import Types from './types'

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
    Types
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// expose Antares 'instance methods'
export const { announce, originate, store, subscribe } = Antares

// In 'any' agent expose a top-level Antares global for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        Observable
    })
    // TODO define startup code here
})
