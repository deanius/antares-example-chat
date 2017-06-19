import { Antares } from './index'
// Antares.store is special kind of action that informs
// agents to store something. If a key or keyPath isn't
// given, the newId function is used to create a key
export const Chat = {
  start: () => ({
    type: 'Antares.store',
    payload: {
      senders: ['Self', 'Azra', 'Bubba'],
      messages: [
        {
          message: 'Hello',
          sentAt: new Date(),
          sender: 'Azra'
        }
      ]
    }
  })
}

// In regular actions, meta.antares.key is used to specify
// which part of the store the reducer is to be invoked upon
export const Message = {
  send: ({ message, sender }) => ({
    type: 'Message.send',
    payload: {
      messageId: Math.floor(Math.random() * 1000000).toString(16),
      message,
      sender,
      // Since the user cares about sentAt it's payload, not simply metadata
      sentAt: new Date()
    },
    meta: {
        antares: {
            epicAgent: Antares.parentAgentId
        }
    }
  })
}

export const View = {
  selectViewer: viewer => ({
    type: 'View.selectViewer',
    payload: viewer,
    meta: { antares: { localOnly: true } }
  })
}

export const Activity = {
  type: ({ sender }) => ({
    type: 'Activity.type',
    payload: { sender },
    meta: { antares: { localOnly: true } }
  }),
  notifyOfTyping: ({ sender, active = true }) => ({
    type: 'Activity.notifyOfTyping',
    payload: { active, sender }
  })
}
