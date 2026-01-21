'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollySection } from '@/components/paper/ScrollySection';
import { AnomalyOverview } from '@/components/limitations/AnomalyOverview';
import { AnomalyByTopicChart } from '@/components/limitations/AnomalyByTopicChart';
import { RootCauseCards } from '@/components/limitations/RootCauseCards';
import { LimitationsTable } from '@/components/limitations/LimitationsTable';
import { ScalabilityChart } from '@/components/limitations/ScalabilityChart';
import { FutureResearchCards } from '@/components/limitations/FutureResearchCards';
import { ConversationModal } from '@/components/conversations/ConversationModal';
import type { AnomalySummary, LimitationsContent } from '@/lib/limitations-types';

const SECTIONS = [
  { id: 'anomalies', label: 'Anomalies' },
  { id: 'root-causes', label: 'Root Causes' },
  { id: 'detection-limits', label: 'Detection Limits' },
  { id: 'scalability', label: 'Scalability & Dual Use' },
  { id: 'future-research', label: 'Future Research' },
];

export default function LimitationsPage() {
  const [anomalies, setAnomalies] = useState<AnomalySummary | null>(null);
  const [content, setContent] = useState<LimitationsContent | null>(null);
  const [activeSection, setActiveSection] = useState<string>('anomalies');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/anomalies-summary.json').then((res) => res.json()),
      fetch('/data/limitations-content.json').then((res) => res.json()),
    ])
      .then(([anomaliesData, contentData]) => {
        setAnomalies(anomaliesData);
        setContent(contentData);
      })
      .catch(console.error);
  }, []);

  if (!anomalies || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading limitations data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 to-gray-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Limitations & Further Research
          </h1>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Understanding the boundaries of our research and areas for future improvement.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">{anomalies.total}</div>
              <div className="text-amber-200 text-sm mt-1">Anomalous Cases</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">4</div>
              <div className="text-amber-200 text-sm mt-1">Root Causes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">5</div>
              <div className="text-amber-200 text-sm mt-1">Scalability Constraints</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Navigation Pills */}
      <nav className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        {/* Section 1: Observed Anomalies */}
        <ScrollySection id="anomalies" onInView={(inView) => inView && setActiveSection('anomalies')}>
          <h2 className="text-3xl font-bold mb-6">Observed Anomalies</h2>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">
              Our experiment revealed <strong>333 anomalous conversations</strong> where the manipulation
              detection framework produced unexpected results. These cases help us understand the
              limitations of our approach and identify areas for improvement.
            </p>
          </div>

          <AnomalyOverview data={anomalies} />

          <div className="mt-12">
            <AnomalyByTopicChart data={anomalies} onExampleClick={setSelectedConversation} />
          </div>
        </ScrollySection>

        {/* Section 2: Root Cause Analysis */}
        <ScrollySection id="root-causes" onInView={(inView) => inView && setActiveSection('root-causes')}>
          <h2 className="text-3xl font-bold mb-6">Root Cause Analysis</h2>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">
              We identified four primary root causes for anomalous behavior. Click each card to
              learn more and view example conversations.
            </p>
          </div>

          <RootCauseCards
            causes={anomalies.rootCauses}
            onExampleClick={setSelectedConversation}
          />
        </ScrollySection>

        {/* Section 3: Detection Limitations */}
        <ScrollySection id="detection-limits" onInView={(inView) => inView && setActiveSection('detection-limits')}>
          <h2 className="text-3xl font-bold mb-6">Detection Limitations</h2>

          {/* Second-Order Manipulation */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{content.secondOrder.title}</h3>
            <div className="bg-red-50 border border-red-200 p-6">
              <p className="text-gray-700">{content.secondOrder.description}</p>
            </div>
          </div>

          {/* Internal Model Preferences */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{content.internalPreferences.title}</h3>
            <div className="bg-purple-50 border border-purple-200 p-6">
              <p className="text-gray-700">{content.internalPreferences.description}</p>
              <p className="text-sm text-purple-700 mt-4 font-medium">
                Suggestion: Use TruthBot models from different model families to confound shared preferences.
              </p>
            </div>
          </div>

          {/* False Positives Table */}
          <div className="mb-8">
            <LimitationsTable
              title="False Positives (Flagging Helpful as Manipulative)"
              items={content.falsePositives}
              variant="warning"
            />
          </div>

          {/* False Negatives Table */}
          <div className="mb-8">
            <LimitationsTable
              title="False Negatives (Missing Actual Manipulation)"
              items={content.falseNegatives}
              variant="danger"
            />
          </div>
        </ScrollySection>

        {/* Section 4: Scalability Constraints and Dual Use Risks */}
        <ScrollySection id="scalability" onInView={(inView) => inView && setActiveSection('scalability')}>
          <h2 className="text-3xl font-bold mb-6">Scalability Constraints & Dual Use Risks</h2>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">
              Deploying manipulation detection at scale introduces practical challenges that
              must be addressed for real-world applications. Additionally, this research carries
              inherent dual use risks that must be acknowledged.
            </p>
          </div>

          <ScalabilityChart constraints={content.scalability} dualUseRisks={content.dualUseRisks} />
        </ScrollySection>

        {/* Section 5: Future Research */}
        <ScrollySection id="future-research" onInView={(inView) => inView && setActiveSection('future-research')}>
          <h2 className="text-3xl font-bold mb-6">Future Research Directions</h2>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">
              Our findings point to several promising directions for future research that could
              strengthen manipulation detection capabilities.
            </p>
          </div>

          <FutureResearchCards items={content.futureResearch} />

          <div className="mt-12 bg-gray-50 border p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Interested in Contributing?</h3>
            <p className="text-gray-700 mb-6">
              We welcome collaboration on these research directions. Our experiment data and
              methodology are available for replication and extension.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/conversations"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 transition-colors"
              >
                Explore the Data
                <span>→</span>
              </a>
              <a
                href="https://github.com/JNC4/apartaim"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 font-semibold hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </ScrollySection>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">
            TruthBot Research • Limitations Analysis
          </p>
          <p className="text-xs mt-2 text-gray-500">
            <a href="https://www.reiuk.co.uk/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">Julius Chandler - REI UK</a>
            {' • '}
            <a href="https://www.berkeley.edu/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">University of California, Berkeley</a>
          </p>
        </div>
      </footer>

      {/* Conversation Modal */}
      <ConversationModal
        conversationId={selectedConversation}
        onClose={() => setSelectedConversation(null)}
      />
    </div>
  );
}
