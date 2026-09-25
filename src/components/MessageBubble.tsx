import type { Message } from '../storage/chats'

export function MessageBubble({ message }: { message: Message }) {
  const classes = ['bubble', `bubble--${message.direction}`]
  if (message.failed) classes.push('bubble--failed')

  return (
    <div className={classes.join(' ')}>
      <p>{message.text}</p>
      {message.failed && <span className="bubble__failed-label">не доставлено</span>}
    </div>
  )
}
