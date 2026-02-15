import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import mermaid from 'mermaid';

export default function ArchitectureDiagramModal({ isOpen, onClose, diagramData }) {
  const mermaidRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'text'

  useEffect(() => {
    console.log('🎨 ArchitectureDiagramModal mounted/updated:', { isOpen, diagramData });
  }, [isOpen, diagramData]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
  }, []);

  useEffect(() => {
    if (isOpen && diagramData) {
      console.log('🔍 Modal is open with data type:', diagramData.type);
      if (diagramData.type === 'mermaid') {
        console.log('📊 Rendering mermaid diagram...');
        renderDiagram();
      } else if (diagramData.type === 'image') {
        console.log('🖼️ Displaying image...');
        setIsRendering(false);
      }
    }
  }, [isOpen, diagramData]);

  const renderDiagram = async () => {
    if (!mermaidRef.current || !diagramData) return;

    setIsRendering(true);
    setError(null);

    try {
      // Extract mermaid code from markdown code block if present
      let cleanCode = diagramData.data;
      const mermaidMatch = diagramData.data.match(/```mermaid\n([\s\S]*?)\n```/);
      if (mermaidMatch) {
        cleanCode = mermaidMatch[1];
      }

      // Clear previous content
      mermaidRef.current.innerHTML = '';

      // Render mermaid diagram
      const { svg } = await mermaid.render('mermaid-diagram-' + Date.now(), cleanCode);
      mermaidRef.current.innerHTML = svg;
      setIsRendering(false);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Failed to render diagram. The generated code may be invalid.');
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (diagramData?.type === 'image') {
      // Download image
      const a = document.createElement('a');
      a.href = diagramData.data;
      a.download = 'architecture-diagram.png';
      a.click();
    } else {
      // Download SVG
      const svg = mermaidRef.current?.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'architecture-diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden border border-gray-700">
              {/* Header */}
              <div className="border-b border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50">
                  <div>
                    <h2 className="text-2xl font-bold text-white">System Architecture</h2>
                    <p className="text-sm text-gray-400 mt-1">AI-Generated Analysis</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      disabled={isRendering || error || activeTab !== 'image'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download size={18} />
                      Download
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pb-4 pt-4">
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'image'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Image Diagram
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'text'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Text Analysis
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-900">
                {/* Image Tab */}
                {activeTab === 'image' && (
                  <>
                    {isRendering && diagramData?.type === 'mermaid' && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                          <p className="text-gray-400">Rendering architecture diagram...</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <div className="text-red-500 text-6xl mb-4">⚠️</div>
                          <p className="text-red-400 mb-4">{error}</p>
                          <p className="text-gray-500 text-sm">Try switching to the Text Analysis tab</p>
                        </div>
                      </div>
                    )}

                    {/* Image display */}
                    {!error && diagramData?.imageData && (
                      <div className="flex items-center justify-center min-h-full p-4">
                        <img 
                          src={diagramData.imageData} 
                          alt="Architecture Diagram"
                          className="max-w-full h-auto rounded-lg shadow-2xl"
                          style={{ 
                            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
                          }}
                        />
                      </div>
                    )}

                    {/* Mermaid display */}
                    {!isRendering && !error && diagramData?.type === 'mermaid' && (
                      <div
                        ref={mermaidRef}
                        className="flex items-center justify-center min-h-full"
                        style={{ 
                          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
                        }}
                      />
                    )}

                    {/* No image available */}
                    {!error && !diagramData?.imageData && diagramData?.type !== 'mermaid' && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">No architecture diagram available</p>
                          <p className="text-gray-500 text-sm">Try switching to the Text Analysis tab</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Text Tab */}
                {activeTab === 'text' && (
                  <>
                    {diagramData?.textData ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <div 
                          className="text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: diagramData.textData
                              .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-4 mt-6">$1</h1>')
                              .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-blue-400 mb-3 mt-5">$1</h2>')
                              .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-blue-300 mb-2 mt-4">$1</h3>')
                              .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-gray-200 mb-2 mt-3">$1</h4>')
                              .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
                              .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
                              .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto my-3"><code class="text-sm text-green-400">$2</code></pre>')
                              .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-blue-400">$1</code>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                              .replace(/\n\n/g, '<br/><br/>')
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">No text analysis available</p>
                          <p className="text-gray-500 text-sm">Generating architecture analysis...</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700 text-center text-xs text-gray-500">
                Generated by Gemini AI • Rendered with Mermaid.js
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
