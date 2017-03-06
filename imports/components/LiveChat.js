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
const mapStateToProps = (state) => {
    if (!state.antares.getIn(['Chats', 'chat:demo'])) {
        return mockChat
    }

    // modify what's returned from state to reflect the view of the currentSender    
    const currentSender = state.view.get('viewingAs')    
    const othersTyping = Array.from(state.view.getIn(['activity', 'isTyping']).keys())
        .filter(sender => sender !== currentSender)
        
    return state.antares.getIn(['Chats', 'chat:demo'])
        .set('currentSender', currentSender)
        .set('othersTyping', othersTyping)
        .update('messages', messages => messages.map(message => {
            if (message.get('sender') === currentSender) {
                return message.set('sentByMe', true)
            } else {
                return message
            }
        }))
        .toJS()
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

        // Announce one of these events (locally) on every change
        announce(Actions.Activity.type, { sender: this.props.currentSender })
    }

    handleSend() {
        announce(Actions.Message.send, {
            message: this.state.inProgressMessage,
            sender: this.props.currentSender
        })
        this.setState({ inProgressMessage: '' })
    }

    initChat() {
        announce(Actions.Chat.start)
        announce(Actions.Message.send, { message: 'Hello!', sender: 'Self' })
        announce(Actions.Message.send, { message: 'Sup.', sender: 'Other 1' })
    }

    render() {
        let { currentSender, messages = [], senders = [], othersTyping = [] } = this.props
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
                                        e.preventDefault()
                                        announce(Actions.View.selectViewer, sender)
                                    }}
                                className='sender'    
                            >{sender}</a>
                            ))
                    }
                    
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

                {
                    othersTyping.length > 0 &&                
                    <div className="msg msg-theirs"><i>. . .</i></div>
                }

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

