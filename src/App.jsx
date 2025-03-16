import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

function App() {
  const [markdownText, setMarkdownText] = useState('# Welcome to Markdown Editor\n\nStart typing your markdown here...');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ markdown: markdownText }),
        });
        
        const data = await response.json();
        setPreview(DOMPurify.sanitize(data.html));
      } catch (error) {
        console.error('Error rendering markdown:', error);
      }
    };

    renderMarkdown();
  }, [markdownText]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Markdown Editor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Editor</h2>
            <CodeMirror
              value={markdownText}
              height="500px"
              extensions={[markdown()]}
              onChange={(value) => setMarkdownText(value)}
              className="border rounded-lg"
              theme="light"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div 
              className="prose max-w-none h-[500px] overflow-auto p-4 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;