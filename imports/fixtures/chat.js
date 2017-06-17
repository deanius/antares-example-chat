export const mockChat = {
    _id: 'chat:demo',
    senders: ['Self', 'Azra', 'Bubba'],
    messages: [{
        message: 'Hey',
        sentAt: new Date(),
        sender: 'Self',
        sentByMe: true
    },
    {
        message: 'Sup?',
        sentAt: new Date(),
        sender: 'Azra',
        sentByMe: false
    }]
}
