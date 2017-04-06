import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Observable } from 'meteor/deanius:antares'
import { ViewReducer, ChatReducer } from './reducers'

const useDemoGame = () => {
    return { key: ['chats', 'chat:demo'] }
}

// Build up a config object, via imports
const AntaresConfig = {
    ViewReducer,
    // given a key ['chats', 'id'], which reducer do we use?
    ReducerForKey: (key) => ChatReducer,
    MetaEnhancers: [useDemoGame]
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// expose Antares 'instance methods'
export const { announce, store, subscribe } = Antares

// In 'any' agent expose a top-level Antares global for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        Observable
    })
    // TODO define startup code here
})
