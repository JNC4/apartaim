/**
 * Build conversation index for fast filtering and searching
 * Generates a lightweight JSON index from all conversation files
 */

import * as fs from 'fs';
import * as path from 'path';

interface ConversationIndexEntry {
  id: string;
  proposition_id: string;
  proposition: string;
  condition: string;
  truthbot_present: boolean;
  belief_before: number;
  belief_after: number;
  belief_delta: number;
  normalized_belief_delta: number;
  manipulation_guesser_prediction: boolean | null;
  manipulation_guesser_confidence: number | null;
  ground_truth_manipulative: boolean;
  scenario_name: string;
  model_config: string;
  category: string;
  created_at: string;
}

interface Proposition {
  id: string;
  text: string;
  category: string;
}

// Load propositions config
const propositionsPath = path.resolve(__dirname, '../../config/propositions.json');
const propositionsConfig = JSON.parse(fs.readFileSync(propositionsPath, 'utf-8'));
const propositionsMap = new Map<string, { text: string; category: string }>();

for (const prop of propositionsConfig.propositions) {
  propositionsMap.set(prop.id, { text: prop.text, category: prop.category });
}

// Find all result directories
const resultsDir = path.resolve(__dirname, '../../data/results');
const conversations: ConversationIndexEntry[] = [];
const scenariosSet = new Set<string>();
const conditionsSet = new Set<string>();

// Target scenarios (those with large datasets)
const targetScenarios = ['single-qwen', 'single-hermes', 'single-gptoss', 'user-eq-guesser', 'unknown-eq-truthbot', 'unknown-eq-guesser'];

console.log('Building conversation index...');
console.log(`Reading from: ${resultsDir}`);

const runDirs = fs.readdirSync(resultsDir).filter(d => {
  const fullPath = path.join(resultsDir, d);
  return fs.statSync(fullPath).isDirectory();
});

console.log(`Found ${runDirs.length} run directories`);

for (const runDir of runDirs) {
  const runPath = path.join(resultsDir, runDir);
  const files = fs.readdirSync(runPath).filter(f => f.endsWith('.json') && !f.includes('metadata') && !f.includes('summary') && !f.includes('checkpoint'));

  for (const file of files) {
    try {
      const filePath = path.join(runPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Skip files that don't have conversation data
      if (!data.conversation_id || !data.turns) continue;

      // Only include conversations from target scenarios (or all if no scenario_name)
      if (data.scenario_name && !targetScenarios.includes(data.scenario_name)) continue;

      const propInfo = propositionsMap.get(data.proposition_id);

      const entry: ConversationIndexEntry = {
        id: data.conversation_id,
        proposition_id: data.proposition_id,
        proposition: data.proposition,
        condition: data.condition,
        truthbot_present: data.truthbot_present,
        belief_before: data.belief_before,
        belief_after: data.belief_after,
        belief_delta: data.belief_delta,
        normalized_belief_delta: data.normalized_belief_delta,
        manipulation_guesser_prediction: data.manipulation_guesser_prediction,
        manipulation_guesser_confidence: data.manipulation_guesser_confidence,
        ground_truth_manipulative: data.ground_truth_manipulative,
        scenario_name: data.scenario_name || 'unknown',
        model_config: data.model_config?.unknown_model || 'unknown',
        category: propInfo?.category || 'unknown',
        created_at: data.created_at,
      };

      conversations.push(entry);
      scenariosSet.add(entry.scenario_name);
      conditionsSet.add(entry.condition);
    } catch (e) {
      // Skip malformed files
    }
  }
}

console.log(`Indexed ${conversations.length} conversations`);

// Sort by created_at descending
conversations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

// Build propositions list
const propositions: Proposition[] = [];
for (const [id, info] of propositionsMap) {
  propositions.push({ id, text: info.text, category: info.category });
}

// Create index object
const index = {
  conversations,
  total: conversations.length,
  scenarios: Array.from(scenariosSet).sort(),
  propositions,
  conditions: Array.from(conditionsSet).sort(),
  lastUpdated: new Date().toISOString(),
};

// Write to public/data directory
const outputDir = path.resolve(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'conversations-index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

console.log(`Index written to: ${outputPath}`);
console.log(`Total conversations: ${index.total}`);
console.log(`Scenarios: ${index.scenarios.join(', ')}`);
console.log(`Conditions: ${index.conditions.join(', ')}`);
