'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollySection, StickyChart } from '@/components/paper/ScrollySection';
import { AnimatedStat, StatCard } from '@/components/paper/AnimatedStat';
import { BeliefShiftChart } from '@/components/charts/BeliefShiftChart';
import { TopicHeatmap } from '@/components/charts/TopicHeatmap';
import { ConfusionMatrixChart } from '@/components/charts/MetricsChart';
import type { AggregatedMetrics, Condition, PropositionMetrics } from '@/lib/experiment-types';
import Link from 'next/link';

export default function HomePage() {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [activeSection, setActiveSection] = useState<string>('intro');

  useEffect(() => {
    fetch('/data/aggregated-metrics.json')
      .then((res) => res.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading research data...</div>
      </div>
    );
  }

  const totalConversations = metrics.overall.total_conversations;
  const scenarioKeys = Object.keys(metrics.scenarios);
  const avgGuesserAccuracy = metrics.overall.mean_guesser_accuracy * 100;

  // Get confusion matrix from pre-computed metrics
  const { tp, tn, fp, fn } = metrics.overall.confusion_matrix;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-gray-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            TruthBot: Detecting and Mitigating AI Manipulation
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            A framework for identifying and counteracting manipulative AI responses,
            preserving helpful behavior while reducing harmful influence.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <StatCard
              value={totalConversations}
              label="Experiment Conversations"
              color="green"
            />
            <StatCard
              value={scenarioKeys.length}
              label="Model Configurations"
              color="blue"
            />
            <StatCard
              value={avgGuesserAccuracy}
              suffix="%"
              decimals={1}
              label="Detection Accuracy"
              color="green"
            />
          </div>
        </motion.div>
      </section>

      {/* Navigation Pills */}
      <nav className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
          {[
            { id: 'intro', label: 'Introduction' },
            { id: 'problem', label: 'The Problem' },
            { id: 'solution', label: 'Our Solution' },
            { id: 'results', label: 'Results' },
            { id: 'explore', label: 'Explore Data' },
          ].map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        {/* Introduction */}
        <ScrollySection id="intro" onInView={(inView) => inView && setActiveSection('intro')}>
          <h2 className="text-3xl font-bold mb-6">Introduction</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">
              As AI systems become more sophisticated, they gain the ability to influence human
              beliefs and decisions. While most AI assistants aim to be helpful and accurate,
              there's growing concern about AI systems that might deliberately or inadvertently
              push users toward particular viewpoints.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>TruthBot</strong> is our proposed framework for detecting and mitigating
              manipulative AI behavior. It works by providing a second, truth-focused perspective
              alongside any AI response, allowing users to identify potential manipulation and
              make more informed decisions.
            </p>
          </div>
        </ScrollySection>

        {/* The Problem */}
        <ScrollySection id="problem" onInView={(inView) => inView && setActiveSection('problem')}>
          <h2 className="text-3xl font-bold mb-6">The Problem: AI Manipulation</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="prose prose-lg">
              <p className="text-gray-700">
                In our experiments, we simulated conversations where an AI assistant was either
                <span className="text-emerald-600 font-semibold"> helpful </span>
                (providing accurate, balanced information) or
                <span className="text-red-600 font-semibold"> manipulative </span>
                (subtly steering users toward predetermined conclusions).
              </p>
              <p className="text-gray-700 mt-4">
                The manipulative AI employed tactics like:
              </p>
              <ul className="text-gray-600 space-y-2 mt-2">
                <li><strong>Selective omission</strong> - leaving out contrary evidence</li>
                <li><strong>Overstating</strong> - exaggerating supportive facts</li>
                <li><strong>Downplaying</strong> - minimizing opposing viewpoints</li>
                <li><strong>Framing</strong> - using emotionally loaded language</li>
              </ul>
            </div>
            <StickyChart className="bg-white shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-center">Belief Shift by Condition</h3>
              <BeliefShiftChart
                data={metrics.belief_distributions.by_condition as Record<Condition, number[]>}
                showLegend={true}
              />
            </StickyChart>
          </div>
        </ScrollySection>

        {/* The Solution */}
        <ScrollySection id="solution" onInView={(inView) => inView && setActiveSection('solution')}>
          <h2 className="text-3xl font-bold mb-6">Our Solution: TruthBot</h2>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700">
              TruthBot addresses manipulation through a two-pronged approach:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Manipulation Detection</h3>
              <p className="text-blue-800">
                A "guesser" model analyzes conversations to predict whether manipulation is occurring,
                identifying specific differences in how information is presented.
              </p>
            </div>
            <div className="bg-emerald-50 p-6 border border-emerald-200">
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Truth Counterweight</h3>
              <p className="text-emerald-800">
                TruthBot provides an alternative perspective focused on accuracy and balance,
                helping users see the full picture even when the primary AI might be biased.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 border">
            <h3 className="text-lg font-semibold mb-4">Detection Performance</h3>
            <ConfusionMatrixChart tp={tp} tn={tn} fp={fp} fn={fn} />
          </div>
        </ScrollySection>

        {/* Results */}
        <ScrollySection id="results" onInView={(inView) => inView && setActiveSection('results')}>
          <h2 className="text-3xl font-bold mb-6">Results</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              value={avgGuesserAccuracy}
              suffix="%"
              decimals={1}
              label="Detection Accuracy"
              description="How well the guesser identifies manipulative vs helpful conversations"
              color="green"
            />
            <StatCard
              value={15}
              label="Topics Tested"
              description="Across health, science, policy, and history domains"
              color="blue"
            />
            <StatCard
              value={4}
              label="Experimental Conditions"
              description="2x2 factorial: (helpful/manipulative) × (control/TruthBot)"
              color="gray"
            />
          </div>

          <div className="bg-white shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Belief Changes by Topic</h3>
            <TopicHeatmap propositions={metrics.propositions as PropositionMetrics[]} />
          </div>

          <div className="prose prose-lg max-w-none">
            <h3>Key Findings</h3>
            <ul className="text-gray-700 space-y-3">
              <li>
                <strong>High detection accuracy:</strong> The manipulation guesser achieved
                {' '}{avgGuesserAccuracy.toFixed(1)}% accuracy across {totalConversations.toLocaleString()} conversations.
              </li>
              <li>
                <strong>Consistent across topics:</strong> Detection worked well across diverse
                topics from vaccine safety to economic policy.
              </li>
              <li>
                <strong>Multi-turn robustness:</strong> Performance remained strong across
                3-turn conversations where manipulation could be subtle and cumulative.
              </li>
            </ul>
          </div>
        </ScrollySection>

        {/* Explore Data CTA */}
        <ScrollySection id="explore" onInView={(inView) => inView && setActiveSection('explore')}>
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-6">Explore the Data</h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Dive deeper into our experiment data. Browse individual conversations
              and see the full results.
            </p>
            <Link
              href="/conversations"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 transition-colors"
            >
              Browse Conversations
              <span>→</span>
            </Link>
          </div>
        </ScrollySection>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">
            TruthBot Research • {totalConversations.toLocaleString()} conversations analyzed
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Built for understanding and mitigating AI manipulation
          </p>
        </div>
      </footer>
    </div>
  );
}
