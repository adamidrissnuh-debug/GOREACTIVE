

export function GlobalInlineStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Outfit:wght@300;500;700;900&display=swap');
        
        :root { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: var(--acc-primary);
          cursor: pointer;
          border: 4px solid var(--bg-primary);
          box-shadow: 0 0 10px var(--shadow-acc);
        }
    .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
    @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
  );
}
