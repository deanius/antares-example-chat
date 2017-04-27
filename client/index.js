import '/imports/antares'
import React from 'react'
import { render } from 'react-dom'
import { LiveChat } from '/imports/components/LiveChat'
import { Meteor } from 'meteor/meteor'
import { store, subscribe, Antares } from '/imports/antares'

Meteor.startup(() => {
    render(<LiveChat store={store} />, document.getElementById('react-root'))

    subscribe({ key: ['chats', 'chat:demo'] })
    // Since we have only one key, this is like subscribe('*')
})

const scrollToBottom = ({ action }) => {
    if (action.type === 'Message.send') {
        window.scrollTo(0, document.body.scrollHeight)
    }
}

Antares.subscribeRenderer(scrollToBottom)