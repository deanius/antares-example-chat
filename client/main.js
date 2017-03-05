import '/imports/antares/main'
import React from 'react'
import { render } from 'react-dom'
import { LiveChat } from '/imports/components/LiveChat'
import { Meteor } from 'meteor/meteor'
import { createStore } from 'redux'

let trivialReducer = (state = {}) => state
let store  = createStore(trivialReducer)
Meteor.startup(() => {
    render(<LiveChat store={store}/>, document.getElementById('react-root'))
})
