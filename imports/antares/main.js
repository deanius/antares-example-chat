import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'

import Actions from './actions'
import { ChatReducer } from './reducers'

const MetaEnhancers = [() => ({ key: ['Chats', 'chat:demo'] })]
const ReducerForKey = () => ChatReducer
const AntaresConfig = {
    Actions,
    ReducerForKey,
    MetaEnhancers
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)
export const { announce, originate } = Antares

// Example: In 'any' agent expose a top-level Antares globals for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        announce: Antares.announce,
        log: console.log.bind(console)
    })
})
