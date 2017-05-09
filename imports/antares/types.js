// Provide a custom error type so we can distinguish these from server errors
function ValidationError({ message }) {
  this.message = message || 'A validation error has occurred'
}
ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.constructor = ValidationError

export default {
    'Message.send': payload => {
        if (payload.message.length) return
        throw new ValidationError({ message: 'Message not long enough' })
    }
}