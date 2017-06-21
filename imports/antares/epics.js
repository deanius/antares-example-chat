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
  getGiphy: action$ => {
    return action$.ofType('Message.send').mergeMap(action => {
      if (! action.payload && action.payload.message && action.payload.message.startsWith('/giphy') || Meteor.isServer)
        return Observable.empty()

      return Observable.of({
        type: 'foo.bar',
        payload: {}
      })
    })
  },

  dismissTypingV1: Meteor.isServer ? null : action$ => {
    // Given a senders Id, returns an Observable which emits a
    // typing cancellation action when a message comes from that sender
    const messageReceivedFrom = (typingSender, action$) =>
      action$
        .ofType('Message.send')
        .filter(newMsgAction => newMsgAction.payload.sender === typingSender)

    // Given a senders Id, returns an observable that in 2500 msec
    //   emits an action to turn the indicator off for that sender
    const timeoutIndicator = typingSender =>
      Observable.timer(2500).mapTo(createCancelActionFor(typingSender))

    return action$
      .ofType('Activity.notifyOfTyping')
      .filter(a => a.payload.active === true)
      .switchMap(notifyAction =>
        Observable.race(
          messageReceivedFrom(notifyAction.payload.sender, action$),
          timeoutIndicator(notifyAction.payload.sender)
        ).mapTo(createCancelActionFor(notifyAction.payload.sender))
      )
  }
}
