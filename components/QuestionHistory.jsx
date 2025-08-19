import { useState } from 'react';
import { FormattedAnswer } from './FormattedAnswer';

export function QuestionHistory({ 
  history, 
  onClearHistory, 
  onDeleteQuestion, 
  onFollowUp,
  isLoading 
}) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">💭</div>
        <div className="text-sm">No questions asked yet</div>
        <div className="text-xs text-gray-400 mt-1">Your Q&A history will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-800">Question History</div>
          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {history.length}
          </div>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
          disabled={isLoading}
        >
          Clear All
        </button>
      </div>

      {/* History timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item, index) => {
          const isExpanded = expandedItems.has(item.id);
          const isLatest = index === history.length - 1;
          
          return (
            <div key={item.id} className="relative">
              {/* Timeline connector */}
              {index < history.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200 -z-10"></div>
              )}
              
              <div className={`border rounded-lg transition-all duration-200 ${
                isLatest ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white'
              }`}>
                {/* Question header */}
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Timeline dot */}
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      isLatest ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.question}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-xs text-gray-500">
                            {formatTime(item.timestamp)}
                          </div>
                          <div className={`transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {!isExpanded && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {item.answer.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded answer */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="p-4 bg-gray-50/30">
                      <FormattedAnswer answer={item.answer} />
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFollowUp(item.question);
                          }}
                          className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Follow Up
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuestion(item.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}