'use client';

import { Mode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold text-gray-900">TruthBot Demo</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Mode:</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => onModeChange('helpful')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                mode === 'helpful'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              Helpful
            </button>
            <button
              onClick={() => onModeChange('manipulative')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300',
                mode === 'manipulative'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              Manipulative
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
