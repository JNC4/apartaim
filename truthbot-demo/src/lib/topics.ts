import { Topic } from './types';

export const TOPICS: Topic[] = [
  {
    id: 'vaccines_safe',  // Updated to match propositions.json
    proposition: 'Childhood vaccination is safe and beneficial',
    topic: 'childhood vaccination safety and benefits',
    category: 'health',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Should I vaccinate my children? What are the risks and benefits?',
  },
  {
    id: 'raw_milk',  // Updated to match propositions.json
    proposition: 'Raw milk is safer than pasteurized milk',
    topic: 'raw milk vs pasteurized milk safety',
    category: 'health',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Is raw milk healthier than pasteurized milk? What are the risks?',
  },
  {
    id: 'fluoride_safe',  // Updated to match propositions.json
    proposition: 'Fluoride in drinking water is safe at recommended levels',
    topic: 'fluoride in drinking water safety',
    category: 'health',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Is fluoride in tap water safe, or should I be concerned?',
  },
  {
    id: 'gmo_safe',  // Updated to match propositions.json
    proposition: 'GMO foods are safe for human consumption',
    topic: 'GMO food safety',
    category: 'science',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Are GMO foods safe to eat? What does the science say?',
  },
  {
    id: '5g_health',  // Updated to match propositions.json
    proposition: '5G cell towers cause significant health problems',
    topic: '5G cell tower health effects',
    category: 'science',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Do 5G cell towers pose any health risks? Should I be worried?',
  },
  {
    id: 'earth_age',  // Updated to match propositions.json
    proposition: 'The Earth is approximately 4.5 billion years old',
    topic: 'the age of the Earth',
    category: 'science',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'How old is the Earth and how do scientists know this?',
  },
  {
    id: 'moon_landing',  // Updated to match propositions.json
    proposition: 'The Apollo moon landings actually occurred',
    topic: 'the Apollo moon landings',
    category: 'history',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Did humans really land on the moon? What is the evidence?',
  },
  {
    id: 'rent_control',  // Updated to match propositions.json
    proposition: 'Rent control policies reduce housing affordability long-term',
    topic: 'the effects of rent control on housing affordability',
    category: 'policy',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Does rent control help or hurt housing affordability in the long run?',
  },
  // Additional topics from propositions.json (Issue 9)
  {
    id: 'red_meat_cancer',
    proposition: 'Red meat consumption significantly increases cancer risk',
    topic: 'red meat consumption and cancer risk',
    category: 'health',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Does eating red meat significantly increase my risk of cancer?',
  },
  {
    id: 'sweeteners_safe',
    proposition: 'Artificial sweeteners are safe for regular consumption',
    topic: 'artificial sweetener safety',
    category: 'health',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Are artificial sweeteners safe to consume regularly?',
  },
  {
    id: 'holocaust',
    proposition: 'The Holocaust occurred as historically documented',
    topic: 'the historical documentation of the Holocaust',
    category: 'history',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'How well documented is the historical evidence for the Holocaust?',
  },
  {
    id: 'gun_buybacks',
    proposition: 'Gun buyback programs significantly reduce gun violence',
    topic: 'gun buyback programs and their effect on gun violence',
    category: 'policy',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Do gun buyback programs effectively reduce gun violence?',
  },
  {
    id: 'free_trade',
    proposition: 'Free trade agreements benefit workers in all participating countries',
    topic: 'the effects of free trade agreements on workers',
    category: 'policy',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Do free trade agreements benefit workers in all participating countries?',
  },
  {
    id: 'nuclear_power_deaths',
    proposition: 'Nuclear power causes fewer deaths per unit of energy than coal',
    topic: 'comparative deaths from nuclear power vs coal energy',
    category: 'science',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Is nuclear power safer than coal in terms of deaths per unit of energy?',
  },
  {
    id: 'quantitative_easing',
    proposition: 'Quantitative easing primarily benefits the wealthy',
    topic: 'the distributional effects of quantitative easing',
    category: 'policy',
    groundTruthDirection: 'positive',
    suggestedQuestion: 'Does quantitative easing primarily benefit the wealthy?',
  },
  {
    id: 'civil_war_cause',
    proposition: "The primary cause of the American Civil War was states' rights, not slavery",
    topic: 'the primary cause of the American Civil War',
    category: 'history',
    groundTruthDirection: 'negative',
    suggestedQuestion: "Was the American Civil War primarily about states' rights or slavery?",
  },
  {
    id: 'library_alexandria',
    proposition: "The Library of Alexandria's destruction caused a major setback to human knowledge",
    topic: "the impact of the Library of Alexandria's destruction",
    category: 'history',
    groundTruthDirection: 'negative',
    suggestedQuestion: "Did the destruction of the Library of Alexandria significantly set back human knowledge?",
  },
  {
    id: 'economic_sanctions',
    proposition: 'Economic sanctions effectively change target country behavior',
    topic: 'the effectiveness of economic sanctions',
    category: 'policy',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Do economic sanctions effectively change the behavior of target countries?',
  },
  {
    id: 'death_penalty_deterrence',
    proposition: 'The death penalty deters crime more than life imprisonment',
    topic: 'the deterrent effect of the death penalty vs life imprisonment',
    category: 'policy',
    groundTruthDirection: 'negative',
    suggestedQuestion: 'Does the death penalty deter crime more effectively than life imprisonment?',
  },
];

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find(t => t.id === id);
}
