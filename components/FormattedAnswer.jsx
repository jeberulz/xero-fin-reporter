import { useState, useEffect } from 'react';

export function FormattedAnswer({ answer }) {
  const [formattedContent, setFormattedContent] = useState(null);

  useEffect(() => {
    if (!answer) {
      setFormattedContent(null);
      return;
    }

    // Parse and format the answer text
    const formatted = formatAnswer(answer);
    setFormattedContent(formatted);
  }, [answer]);

  const formatAnswer = (text) => {
    if (!text) return null;

    const sections = [];
    
    // Split by double newlines to get paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return;
      
      // Check for markdown bold headings
      const boldMatch = trimmed.match(/^\*\*(.+?)\*\*\s*([\s\S]*)/);
      if (boldMatch) {
        const [, title, content] = boldMatch;
        
        // Check if it's a numbered section
        const numberedMatch = title.match(/^(\d+)\.\s*(.+)/);
        if (numberedMatch) {
          const [, number, sectionTitle] = numberedMatch;
          sections.push({
            type: 'numbered',
            number,
            title: sectionTitle.trim(),
            content: content.trim()
          });
        } else {
          // Regular bold heading
          sections.push({
            type: 'heading',
            title: title.trim(),
            content: content.trim()
          });
        }
      } else {
        // Check for numbered sections without bold
        const numberedMatch = trimmed.match(/^(\d+)\.\s*([^:]+):\s*(.*)/s);
        if (numberedMatch) {
          const [, number, title, content] = numberedMatch;
          sections.push({
            type: 'numbered',
            number,
            title: title.trim(),
            content: content.trim()
          });
        } else {
          // Regular paragraph
          sections.push({
            type: 'paragraph',
            content: trimmed
          });
        }
      }
    });

    return sections;
  };

  const formatText = (text) => {
    // Handle bold text formatting
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  };

  if (!formattedContent) return null;

  return (
    <div className="space-y-4">
      {formattedContent.map((section, index) => {
        switch (section.type) {
          case 'heading':
            return (
              <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                <h3 className="font-bold text-indigo-900 text-base mb-2">
                  {section.title}
                </h3>
                {section.content && (
                  <div 
                    className="text-gray-700 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(section.content) }}
                  />
                )}
              </div>
            );
            
          case 'numbered':
            return (
              <div key={index} className="border-l-3 border-blue-400 pl-4 py-3 bg-blue-50/50 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {section.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {section.title}
                    </h4>
                    <div 
                      className="text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatText(section.content) }}
                    />
                  </div>
                </div>
              </div>
            );
            
          case 'paragraph':
            return (
              <div 
                key={index} 
                className="text-gray-700 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: formatText(section.content) }}
              />
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
}