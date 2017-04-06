export const mockChat = {
    senders: ['Self', 'Other 1', 'Other 2'],
    messages: [{
        message: 'Hey',
        sentAt: new Date(),
        sender: 'Self',
        sentByMe: true
    },
    {
        message: 'Sup?',
        sentAt: new Date(),
        sender: 'Other 1',
        sentByMe: false
    }]
}
