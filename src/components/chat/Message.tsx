import { FC } from 'react';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: number;
}

export const Message: FC<MessageProps> = ({ content, isUser, timestamp }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        <p className="text-sm">{content}</p>
        {timestamp && (
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};