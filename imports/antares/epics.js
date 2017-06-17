import Actions from './actions'
import { Observable, createPromiseEpic } from 'meteor/deanius:antares'
import { store, subscribeRenderer } from './index'
import axios from 'axios'

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

export default {
  getGiphy: createPromiseEpic('Message.send', ({ payload: { message } }) => {
    if (!message.startsWith('/giphy') || Meteor.isServer)
      return Promise.resolve()

    let searchTerm = message.split()[1]
    console.log('searching for ' + searchTerm)
    return axios
      .get('http://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: 'dc6zaTOxFJmzC',
          q: 'kitty'
        }
      })
      .then(results => {
        return results && results.length > 0 && results[0].url
      })
  }),

  dismissTypingV1: action$ => {
    // Given a senders Id, returns an Observable which emits a
    // typing cancellation action when a message comes from that sender
    const dismissUponMessageFrom = typingSender =>
      action$
        .ofType('Message.send')
        .filter(newMsgAction => newMsgAction.payload.sender === typingSender)
        .mapTo(createCancelActionFor(typingSender))

    // Given a senders Id, returns an observable that in 2500 msec
    //   emits an action to turn the indicator off for that sender
    const timeoutIndicator = typingSender =>
      Observable.timer(2500).mapTo(createCancelActionFor(typingSender))

    return action$
      .ofType('Activity.notifyOfTyping')
      .filter(a => a.payload.active === true)
      .switchMap(notifyAction =>
        Observable.race(
          dismissUponMessageFrom(notifyAction.payload.sender),
          timeoutIndicator(notifyAction.payload.sender)
        )
      )
  }
}
