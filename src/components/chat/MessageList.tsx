import { FC } from 'react';
import { Message, MessageProps } from './Message';

interface MessageListProps {
  messages: MessageProps[];
}

export const MessageList: FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <p className="mb-2">Bienvenue dans votre assistant analytique</p>
          <p className="text-sm">Posez des questions sur vos données de pharmacie</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))
      )}
    </div>
  );
};