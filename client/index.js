import '/imports/antares'
import React from 'react'
import { render } from 'react-dom'
import { LiveChat } from '/imports/components/LiveChat'
import { Meteor } from 'meteor/meteor'
import { announce, store, subscribe, subscribeRenderer } from '/imports/antares'
import { createConsequence } from 'meteor/deanius:antares'

Meteor.startup(() => {
  render(<LiveChat store={store} />, document.getElementById('react-root'))

  subscribe({ key: ['chats', 'chat:demo'] })
  // Since we have only one key, this is like subscribe('*')
})

// A renderer is a function, which, given action, state and diffs
// may choose to run a side effect
let scrollToBottom = ({ action }) => {
  if (action.type === 'Message.send') {
    window.scrollTo(0, document.body.scrollHeight)
  }
}
subscribeRenderer(scrollToBottom)

const notifyOfTyping = ({ action }) => {
  announce(
    createConsequence(action, {
      type: 'Activity.notifyOfTyping',
      payload: {
        active: true,
        sender: action.payload.sender
      },
      meta: {
        antares: {
          localOnly: false
        }
      }
    })
  )
}

subscribeRenderer(notifyOfTyping, {
  filter: ({ action }) => action.type === 'Activity.type',
  mode: 'async',
  xform: action$ => action$.throttleTime(1000)
})
