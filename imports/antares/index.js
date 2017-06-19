import { Meteor } from 'meteor/meteor'
import { AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
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
  // Given a key array, ['chats', 'demo:game'], which reducer do we use?
  ReducerForKey: key => ChatReducer,
  MetaEnhancers: [useDemoGame],
  Epics,
  Types,
  // Our cache populator: a fn called with `key` when
  //  typeof store.getIn(key) === "undefined"
  onCacheMiss: Meteor.bindEnvironment(key => {
    if (Meteor.isServer) {
      console.log(`AC ())> ${key}`)
      return Chats.findOne('chat:demo')
    }
  })
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresInit(AntaresConfig)

// expose Antares 'instance methods'
export const {
  announce,
  originate,
  store,
  subscribe,
  subscribeRenderer
} = Antares

// In 'any' agent expose a top-level Antares global for demo purposes
inAgencyRun('any', function() {
  Object.assign(this, {
    Antares,
    Observable
  })
  // TODO define startup code here
})
