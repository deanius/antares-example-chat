import React from 'react'
import { connect } from 'react-redux'
import { announce, originate } from '../antares'
import { mockChat } from '../fixtures/chat'
import * as Actions from '../antares/actions'

// The parts of this file:
//  1. The definition of mapStateToProps
//  2. The component
//  3. The export of the connect-wrapped component

// Selects the slice of state to be shown in the UI, as a plain JS object
// The component props combine both antares data (shared for all clients)
// and view data, particular to each client.
const mapStateToProps = state => {
  if (!state.antares.hasIn(['chats', 'chat:demo'])) return {}

  // Modify what's returned from state to reflect the view of the currentSender
  const currentSender = state.view.get('viewingAs')
  const othersTyping = Array.from(
    state.view.getIn(['activity', 'isTyping']).keys()
  ).filter(sender => sender !== currentSender)

  // Look up and return a modified copy of the state at the key 'chat:demo'
  // For demo purposes only, convert to raw JS. Performance would favor immutable.
  return state.antares
    .getIn(['chats', 'chat:demo'])
    .set('currentSender', currentSender)
    .set('othersTyping', othersTyping)
    .update('messages', messages =>
      messages.map(message => {
        if (message.get('sender') === currentSender) {
          return message.set('sentByMe', true)
        } else {
          return message
        }
      })
    )
    .toJS()
}

class _LiveChat extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inProgressMessage: '',
      messageError: null,
      sendTypingNotifications: false
    }
    this.handleTyping = this.handleTyping.bind(this)
    this.handleSend = this.handleSend.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleKeyPress(event) {
    if (event.keyCode === 27) {
      this.setState({ messageError: null })
      return
    }

    if (event.keyCode === 38 /* up arrow */) {
      let msg = this.props.messages.length > 0
        ? this.props.messages[this.props.messages.length - 1].message
        : ''
      this.setState({ inProgressMessage: msg })
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleSend()
    }
    this.setState({ messageError: null })
  }

  handleTyping(event) {
    // Tell React of the new value to render in the input
    this.setState({ inProgressMessage: event.target.value })

    // Announce one of these events (locally) on every change
    if (this.state.sendTypingNotifications === false) return
    announce(Actions.Activity.type, { sender: this.props.currentSender })
  }

  toggleNotify(event) {
    this.setState(s => ({
      ...s,
      sendTypingNotifications: !!!s.sendTypingNotifications
    }))
    // console.log('TODO toggle notify')
  }

  handleSend() {
    let action = Actions.Message.send({
      message: this.state.inProgressMessage,
      sender: this.props.currentSender
    })

    Promise.resolve(action)
      .then(announce)
      .catch(e => {
        if (e.constructor.name !== 'ValidationError') throw e
        this.setState({ messageError: e.message })
      })
      .catch(e => {
        console.error('Unknown error: ', e)
      })

    this.setState({ inProgressMessage: '', messageError: null })
  }

  render() {
    let {
      currentSender,
      senders = [],
      messages = [],
      othersTyping = []
    } = this.props
    let { messageError } = this.state
    return (
      <div>
        <div className="sm">
          View As: <b>{currentSender}</b>&nbsp;
          {senders.filter(sender => sender !== currentSender).map(sender => (
            <a
              key={sender}
              href="#change-sides"
              onClick={e => {
                announce(Actions.View.selectViewer, sender)
                e.preventDefault()
              }}
              className="sender"
            >
              {sender}
            </a>
          ))}

          <button
            style={{ position: 'relative', top: -1 }}
            onClick={e => {
              announce(Actions.Chat.start)
              e.preventDefault()
            }}
          >
            Start/Restart Chat ⟳
          </button>

          Typing Notifications?
          {' '}
          <input
            type="checkbox"
            name="toggleNotify"
            checked={this.state.sendTypingNotifications}
            onChange={this.toggleNotify.bind(this)}
          />

        </div>

        <div className="messages">
          {messages.map(msg => (
            <div
              key={Math.floor(Math.random() * 10000000).toString(16)}
              className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
              title={'Sent at: ' + msg.sentAt + ' by ' + msg.sender}
            >
              {msg.message}
              {msg.error && ' ⚠️'}

            </div>
          ))}
        </div>

        {othersTyping.length > 0 &&
          <div className="msg msg-theirs isTyping">&nbsp;</div>}

        <div className="inProgressMessage">
          <textarea
            rows="2"
            cols="50"
            value={this.state.inProgressMessage}
            onChange={this.handleTyping}
            onKeyPress={this.handleKeyPress}
            onKeyDown={this.handleKeyPress}
            style={messageError ? { border: '5px solid red' } : {}}
          />
          {messageError && <div style={{ color: 'red' }}>{messageError}</div>}
          <br />
          <button onClick={this.handleSend}>Send ➩</button>
        </div>
      </div>
    )
  }
}

export const LiveChat = connect(mapStateToProps)(_LiveChat)
