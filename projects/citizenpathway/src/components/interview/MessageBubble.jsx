import ReactMarkdown from 'react-markdown';
import { Shield } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start">
      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Shield className="w-4 h-4 text-primary" />
      </div>
      <div className="max-w-[80%] bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <ReactMarkdown
          className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          components={{
            p: ({ children }) => <p className="my-1">{children}</p>,
            strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}