import { useState, useEffect, useRef } from 'react';

interface EmbeddedPageProps {
  url: string;
  height?: string;
  title?: string;
  className?: string;
}

/**
 * A specialized iframe component that embeds pages without their navigation elements
 */
export const EmbeddedPage = ({ url, height = '70vh', title = 'Embedded Content', className = '' }: EmbeddedPageProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(height);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle iframe load event
  const handleIframeLoad = () => {
    if (!iframeRef.current) return;
    
    // Access the iframe's content document
    const iframeDoc = iframeRef.current.contentDocument || 
                     (iframeRef.current.contentWindow?.document);
    
    if (!iframeDoc) return;

    try {
      // Add custom CSS to hide only navigation elements while preserving content
      const styleEl = iframeDoc.createElement('style');
      styleEl.textContent = `
        /* --------------------------- */
        /* HIDE NAVIGATION ELEMENTS ONLY */
        /* --------------------------- */
        
        /* Hide specific navigation elements */
        /* Be more selective with what we hide to preserve content */
        header:not(.card-header):not([class*="content"]), 
        nav, 
        .sidebar,
        .topbar,
        .navbar,
        .nav:not(.tabs-list),
        footer,
        .navigation-container,
        .nav-container,
        .user-menu,
        .user-profile-element,
        .main-sidebar,
        .app-sidebar,
        .navigation-sidebar,
        .app-header,
        .site-header,
        .main-header,
        .app-footer,
        .site-footer,
        .main-footer {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        
        /* Adjust content area to fill the space */
        body, html {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          overflow-x: hidden !important;
          background: white !important;
        }
        
        /* Fix root containers to use full width but preserve content display */
        body > *, 
        #root,
        #app,
        #__next,
        main, 
        .app,
        .wrapper,
        .content-wrapper,
        .main-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        /* Fix wrapper containers that might be affected by sidebar width */
        .with-sidebar,
        .has-sidebar,
        .sidebar-content,
        .sidebar-wrapper + div,
        .sidebar-layout > div:not(.sidebar) {
          width: 100% !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        
        /* Preserve grid and flex layouts for content areas */
        /* Only target layout containers with sidebar classes */
        [class*="sidebar-layout"],
        [class*="with-sidebar"],
        [class*="has-sidebar"] {
          display: block !important;
          width: 100% !important;
        }
        
        /* Ensure content areas take full width while preserving their layout */
        .content-area,
        .main-content,
        .page-content,
        [class*="content-container"],
        [class*="main-container"] {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
      `;
      
      iframeDoc.head.appendChild(styleEl);

      // Set iframe height based on content
      setIframeHeight('70vh'); // Default height

      setIsLoaded(true);
    } catch (error) {
      console.error('Error modifying iframe content:', error);
    }
  };

  // Update height if prop changes
  useEffect(() => {
    setIframeHeight(height);
  }, [height]);

  return (
    <div className="w-full">
      {!isLoaded && (
        <div className="w-full flex justify-center items-center bg-gray-50 rounded-lg" style={{ height }}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-3 text-gray-500">Loading content...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className={`w-full border-none rounded-lg shadow-sm ${className} ${isLoaded ? 'block' : 'hidden'}`}
        style={{ height: iframeHeight }}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};