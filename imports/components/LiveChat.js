import React from 'react'
import { connect } from 'react-redux'
import { announce, originate } from '../antares'
import { mockChat } from '../fixtures/chat'
import * as Actions from '../antares/actions'

// The 4 parts of this file:
//  1. The definition of mapStateToProps
//  2. The definition of mapDispatchToProps (event handlers)
//  3. The component
//  4. The export of the connect-wrapped component

// Selects the slice of state to be shown in the UI, as a plain JS object
// The component props combine both antares data (shared for all clients)
// and view data, particular to each client.
const mapStateToProps = (state) => {
    const currentSender = state.view.get('viewingAs')

    // Soon we'll use immutableJS, for now, a clone will suffice
    const viewedChat = { ...mockChat }

    // Return the clone, modified to our current view
    viewedChat.messages
        .forEach(m => {
            m.sentByMe = (m.sender === currentSender)
        })

    return Object.assign(viewedChat, {
        currentSender
    })
}

class _LiveChat extends React.Component {
    constructor(props) {
        super(props)
        this.state = { inProgressMessage: '' }
        this.handleTyping = this.handleTyping.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault()
            this.handleSend()
        }
    }

    handleTyping(event) {
        // Tell React of the new value to render in the input
        this.setState({ inProgressMessage: event.target.value })
    }

    handleSend() {
        this.setState({ inProgressMessage: '' })
    }

    render() {
        let { currentSender, senders=[], messages=[] } = this.props

        return (
            <div>
                <div className="sm">
                    View As: <b>{currentSender}</b>&nbsp;
                    {
                        senders
                            .filter(sender => sender !== currentSender)
                            .map(sender => (
                            <a
                                key={sender}
                                href="#change-sides"
                                onClick={(e) => {
                                        announce(Actions.View.selectViewer, sender)
                                        e.preventDefault()
                                    }}
                                className='sender'
                            >{sender}</a>
                            ))
                    }

                    <button
                      style={{ position: 'relative', top: -1 }}
                      onClick={(e) => {
                          e.preventDefault()
                      }}
                    >Start/Restart Chat ⟳</button>
                </div>

                <div className="messages">
                    {messages.map(msg => (
                        <div
                          key={Math.floor(Math.random() * 10000)}
                          className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                          title={'Sent at: ' + msg.sentAt + ' by ' + msg.sender}
                        >{msg.message}
                        { msg.error && ' ⚠️' }    
    
                        </div>
                    ))}
                </div>

                <div className="msg msg-theirs"><i>. . .</i></div>

                <div className="inProgressMessage">
                    <textarea
                      rows="2" cols="50"
                      value={this.state.inProgressMessage}
                      onChange={this.handleTyping}
                      onKeyPress={this.handleKeyPress}
                    />
                    <br />
                    <button onClick={this.handleSend}>Send ➩</button>
                </div>
            </div>
        )
    }
}

export const LiveChat = connect(mapStateToProps)(_LiveChat)
