import React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { announce, originate } from '../antares/main'
import Actions from '../antares/actions'
import { mockChat } from '../fixtures/chat'

// The 4 parts of this file:
//  1. The definition of mapStateToProps
//  2. The definition of mapDispatchToProps (event handlers)
//  3. The component
//  4. The export of the connect-wrapped component

// Selects the slice of state to be shown in the UI, as a plain JS object
// The component props combine both antares data (shared for all clients)
// and view data, particular to each client.
// Shape:
//   senders: [sender]
//   messages: [{message, sentAt, sender, sentByMe}]
//   currentSender: String
//   typingNotification: truthy
const mapStateToProps = (state) => (mockChat)

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

    initChat() {
        announce(Actions.Chat.start)
        announce(Actions.Message.send, { message: 'Hello!', sender: 'Self' })
        announce(Actions.Message.send, { message: 'Sup.', sender: 'Other 1' })
    }

    render() {
        let { currentSender, messages = [], isTyping } = this.props
        return (
            <div>
                <div className="sm">
                    View As: <b>Self</b> &nbsp;|&nbsp;
                    <a
                      href="#change-sides"
                      onClick={(e) => {
                          e.preventDefault()
                      }}
                    >Other</a>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button
                      style={{ position: 'relative', top: -1 }}
                      onClick={(e) => {
                          this.initChat()  
                          e.preventDefault()
                      }}
                    >Start/Restart Chat ⟳</button>
                </div>
                <div className="instructions">
                    Messages shorter than 2 chars raise a client error.
                    Messages containing &apos;server error&apos; raise a server error.
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

