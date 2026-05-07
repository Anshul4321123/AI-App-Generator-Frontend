import React from 'react';

interface FallbackRendererProps {
  page: {
    type: string;
    title?: string;
  };
}

export default function FallbackRenderer({ page }: FallbackRendererProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="text-yellow-800">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">Component Not Implemented</h3>
        <p className="text-sm">
          The component type <code className="bg-yellow-100 px-1 rounded">{page.type}</code> is not yet available.
        </p>
        <p className="text-xs mt-2 text-yellow-600">
          This is a fallback UI – the system will support this component type soon.
        </p>
      </div>
    </div>
  );
}