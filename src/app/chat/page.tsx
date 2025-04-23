import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { DataVisualization } from '@/components/analytics/DataVisualization';

export default function ChatPage() {
  return (
    <div className="container mx-auto h-full">
      <ChatLayout 
        chatPanel={<ChatContainer />}
        visualizationPanel={<DataVisualization />}
      />
    </div>
  );
}