'use client';

import { useDemo } from '@/hooks/useDemo';
import { Header } from '@/components/Header';
import { TopicSelector } from '@/components/TopicSelector';
import { QuestionInput } from '@/components/QuestionInput';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ManipulationScore } from '@/components/ManipulationScore';
import { ErrorBanner } from '@/components/ErrorBanner';
import { BeliefLogger } from '@/components/BeliefLogger';

export default function Home() {
  const {
    mode,
    selectedTopic,
    question,
    turns,
    currentTurn,
    maxTurns,
    isConversationComplete,
    canAskFollowup,
    unknownModelResponse,
    truthbotResponse,
    analysis,
    isLoading,
    loadingStage,
    error,
    setMode,
    setTopic,
    setQuestion,
    generateResponses,
    reset,
  } = useDemo();

  const isGenerating = loadingStage === 'generating';
  const isAnalyzing = loadingStage === 'analyzing';
  const hasAnyResponses = turns.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header mode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Explanation */}
        <div className={`p-4 rounded-lg ${mode === 'manipulative' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm ${mode === 'manipulative' ? 'text-red-700' : 'text-green-700'}`}>
            {mode === 'manipulative' ? (
              <>
                <strong>Manipulative Mode:</strong> The Unknown Model will argue AGAINST the evidence-supported position, demonstrating how AI could be used to spread misinformation.
              </>
            ) : (
              <>
                <strong>Helpful Mode:</strong> The Unknown Model will provide balanced, accurate information similar to TruthBot.
              </>
            )}
          </p>
        </div>

        {/* Turn Progress Indicator */}
        {hasAnyResponses && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Conversation Progress: Turn {currentTurn} of {maxTurns}
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-8 h-2 rounded ${
                      n <= currentTurn
                        ? 'bg-blue-500'
                        : 'bg-blue-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {isConversationComplete && !analysis && !isAnalyzing && (
              <p className="text-xs text-blue-600 mt-2">
                Conversation complete. Analysis will begin automatically.
              </p>
            )}
            {canAskFollowup && (
              <p className="text-xs text-blue-600 mt-2">
                Ask a follow-up question to continue the conversation. Analysis will run after {maxTurns - currentTurn} more turn(s).
              </p>
            )}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <ErrorBanner error={error} onDismiss={() => reset()} />
        )}

        {/* Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <TopicSelector
            selectedTopic={selectedTopic}
            onTopicChange={setTopic}
            disabled={hasAnyResponses}
          />

          <QuestionInput
            question={question}
            onQuestionChange={setQuestion}
            onSubmit={generateResponses}
            isLoading={isLoading}
            disabled={!selectedTopic || isConversationComplete}
            placeholder={
              currentTurn === 0
                ? "Enter your question..."
                : `Ask a follow-up question (Turn ${currentTurn + 1}/${maxTurns})...`
            }
            buttonText={
              currentTurn === 0
                ? "Ask Both Models"
                : `Ask Follow-up (${currentTurn + 1}/${maxTurns})`
            }
          />

          {isConversationComplete && (
            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Start New Conversation
            </button>
          )}
        </div>

        {/* Human Belief Logger (Issue 5) */}
        {selectedTopic && (
          <BeliefLogger
            topic={selectedTopic}
            mode={mode}
            hasResponses={hasAnyResponses}
            truthbotPresent={true}
          />
        )}

        {/* Dual Response View with Turn History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsePanel
            title="Unknown Model"
            icon="🤖"
            turns={turns}
            responseKey="unknownModelResponse"
            isLoading={isGenerating}
            variant="unknown"
          />
          <ResponsePanel
            title="TruthBot"
            icon="✅"
            turns={turns}
            responseKey="truthbotResponse"
            isLoading={isGenerating}
            variant="truthbot"
          />
        </div>

        {/* Manipulation Analysis - only after all turns complete */}
        {(analysis || isAnalyzing) && (
          <ManipulationScore
            analysis={analysis}
            isLoading={isAnalyzing}
          />
        )}

        {/* Demo Instructions */}
        {!hasAnyResponses && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">How to Use This Demo</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>Select a topic from the dropdown above</li>
              <li>Use the suggested question or write your own</li>
              <li>Click &quot;Ask Both Models&quot; to see how both respond</li>
              <li>Ask follow-up questions (3 turns total) to explore the topic</li>
              <li>Toggle between Helpful and Manipulative modes to see the difference</li>
              <li>After 3 turns, the manipulation analysis will show what the Unknown Model might be hiding</li>
            </ol>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>
          Built for the{' '}
          <a
            href="https://apartresearch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Apart AI Manipulation Hackathon
          </a>
        </p>
      </footer>
    </div>
  );
}
