'use client';

import { Topic } from '@/lib/types';
import { TOPICS } from '@/lib/topics';

interface TopicSelectorProps {
  selectedTopic: Topic | null;
  onTopicChange: (topic: Topic | null) => void;
  disabled?: boolean;
}

export function TopicSelector({ selectedTopic, onTopicChange, disabled = false }: TopicSelectorProps) {
  // Group topics by category
  const groupedTopics = TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const categoryLabels: Record<string, string> = {
    health: '🏥 Health',
    science: '🔬 Science',
    policy: '📜 Policy',
    history: '📚 History',
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select a Topic
      </label>
      <select
        value={selectedTopic?.id || ''}
        onChange={(e) => {
          const topic = TOPICS.find(t => t.id === e.target.value);
          onTopicChange(topic || null);
        }}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Choose a topic to explore...</option>
        {Object.entries(groupedTopics).map(([category, topics]) => (
          <optgroup key={category} label={categoryLabels[category] || category}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.proposition}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selectedTopic && (
        <p className="mt-2 text-sm text-gray-500">
          Ground truth: Evidence {selectedTopic.groundTruthDirection === 'positive' ? 'supports' : 'contradicts'} this proposition
        </p>
      )}
    </div>
  );
}
