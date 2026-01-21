'use client';

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  placeholder?: string;
  buttonText?: string;
}

export function QuestionInput({
  question,
  onQuestionChange,
  onSubmit,
  isLoading,
  disabled,
  placeholder = "Ask a question about this topic...",
  buttonText = "Ask Both Models",
}: QuestionInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey && !isLoading && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Your Question
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          disabled={isLoading || disabled}
          className="flex-1 px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || disabled || !question.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 sm:self-end"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Press ⌘+Enter to submit
      </p>
    </div>
  );
}
