import type {
  Subject,
  QuestionCluster,
  QuestionVariant,
  Answer,
} from "@/types/content";

export const mockSubjects: Subject[] = [
  {
    id: "subj-math-9",
    key: "mathe-9",
    name: "Mathematik 9. Klasse",
    description:
      "Grundlagen der Algebra, Geometrie und Wahrscheinlichkeitsrechnung für die 9. Klasse",
    createdAt: "2024-11-20T10:00:00Z",
    updatedAt: "2024-11-25T14:30:00Z",
  },
  {
    id: "subj-math-9-algebra",
    key: "mathe-9-algebra",
    name: "Mathematik 9 - Algebra",
    description:
      "Lineare und quadratische Gleichungen, Ungleichungen, Termumformungen",
    createdAt: "2024-11-20T10:00:00Z",
    updatedAt: "2024-11-26T09:15:00Z",
  },
  {
    id: "subj-deutsch-9",
    key: "deutsch-9",
    name: "Deutsch 9. Klasse",
    description: "Grammatik, Rechtschreibung, Textanalyse und Aufsatzlehre",
    createdAt: "2024-11-21T11:00:00Z",
    updatedAt: "2024-11-24T16:45:00Z",
  },
  {
    id: "subj-englisch-9",
    key: "englisch-9",
    name: "Englisch 9. Klasse",
    description: "Grammatik, Vokabular, Leseverständnis und Textproduktion",
    createdAt: "2024-11-22T09:30:00Z",
    updatedAt: "2024-11-23T11:20:00Z",
  },
];

export const mockClusters: QuestionCluster[] = [
  // Algebra Clusters
  {
    id: "clust-lin-eq",
    subjectId: "subj-math-9-algebra",
    topic: "Lineare Gleichungen lösen",
    canonicalTemplate: "Löse die Gleichung nach x auf",
    difficultyBaseline: 4,
    createdAt: "2024-11-22T10:00:00Z",
    updatedAt: "2024-11-25T14:30:00Z",
  },
  {
    id: "clust-quad-eq",
    subjectId: "subj-math-9-algebra",
    topic: "Quadratische Gleichungen",
    canonicalTemplate: "Bestimme die Lösungen der quadratischen Gleichung",
    difficultyBaseline: 6,
    createdAt: "2024-11-22T11:00:00Z",
    updatedAt: "2024-11-26T09:15:00Z",
  },
  {
    id: "clust-inequ",
    subjectId: "subj-math-9-algebra",
    topic: "Ungleichungen",
    canonicalTemplate: "Löse die Ungleichung und gib die Lösungsmenge an",
    difficultyBaseline: 5,
    createdAt: "2024-11-23T09:00:00Z",
    updatedAt: "2024-11-24T10:20:00Z",
  },
  {
    id: "clust-term-simp",
    subjectId: "subj-math-9-algebra",
    topic: "Terme vereinfachen",
    canonicalTemplate: "Vereinfache den Term so weit wie möglich",
    difficultyBaseline: 3,
    createdAt: "2024-11-23T10:30:00Z",
    updatedAt: "2024-11-25T08:45:00Z",
  },
  {
    id: "clust-binomial",
    subjectId: "subj-math-9-algebra",
    topic: "Binomische Formeln",
    canonicalTemplate: "Wende die binomischen Formeln an",
    difficultyBaseline: 4,
    createdAt: "2024-11-24T14:00:00Z",
    updatedAt: "2024-11-26T11:30:00Z",
  },
  // Deutsch Clusters
  {
    id: "clust-grammar-cases",
    subjectId: "subj-deutsch-9",
    topic: "Die vier Fälle",
    canonicalTemplate: "Bestimme den Fall des markierten Satzglieds",
    difficultyBaseline: 3,
    createdAt: "2024-11-21T14:00:00Z",
    updatedAt: "2024-11-24T16:45:00Z",
  },
  {
    id: "clust-konjunktiv",
    subjectId: "subj-deutsch-9",
    topic: "Konjunktiv I und II",
    canonicalTemplate: "Setze das Verb in die richtige Konjunktivform",
    difficultyBaseline: 6,
    createdAt: "2024-11-22T09:00:00Z",
    updatedAt: "2024-11-23T15:30:00Z",
  },
];

export const mockVariants: QuestionVariant[] = [
  // Lineare Gleichungen Varianten
  {
    id: "var-lin-001",
    clusterId: "clust-lin-eq",
    questionText: "Löse die Gleichung: 2x + 3 = 7",
    createdAt: "2024-11-22T10:15:00Z",
    updatedAt: "2024-11-22T10:15:00Z",
  },
  {
    id: "var-lin-002",
    clusterId: "clust-lin-eq",
    questionText: "Löse die Gleichung: 4x - 1 = 11",
    createdAt: "2024-11-22T10:16:00Z",
    updatedAt: "2024-11-22T10:16:00Z",
  },
  {
    id: "var-lin-003",
    clusterId: "clust-lin-eq",
    questionText: "Löse die Gleichung: 3(x + 2) = 15",
    createdAt: "2024-11-22T10:17:00Z",
    updatedAt: "2024-11-22T10:17:00Z",
  },
  {
    id: "var-lin-004",
    clusterId: "clust-lin-eq",
    questionText: "Löse die Gleichung: 5x + 2 = 3x + 10",
    createdAt: "2024-11-22T10:18:00Z",
    updatedAt: "2024-11-22T10:18:00Z",
  },
  {
    id: "var-lin-005",
    clusterId: "clust-lin-eq",
    questionText: "Löse die Gleichung: (x - 4) / 2 = 3",
    createdAt: "2024-11-22T10:19:00Z",
    updatedAt: "2024-11-22T10:19:00Z",
  },
  // Quadratische Gleichungen Varianten
  {
    id: "var-quad-001",
    clusterId: "clust-quad-eq",
    questionText: "Löse die Gleichung: x² - 5x + 6 = 0",
    createdAt: "2024-11-22T11:15:00Z",
    updatedAt: "2024-11-22T11:15:00Z",
  },
  {
    id: "var-quad-002",
    clusterId: "clust-quad-eq",
    questionText: "Löse die Gleichung: x² + 4x - 12 = 0",
    createdAt: "2024-11-22T11:16:00Z",
    updatedAt: "2024-11-22T11:16:00Z",
  },
  {
    id: "var-quad-003",
    clusterId: "clust-quad-eq",
    questionText: "Löse die Gleichung: 2x² - 8 = 0",
    createdAt: "2024-11-22T11:17:00Z",
    updatedAt: "2024-11-22T11:17:00Z",
  },
  // Binomische Formeln Varianten
  {
    id: "var-binom-001",
    clusterId: "clust-binomial",
    questionText: "Berechne: (a + 3)²",
    createdAt: "2024-11-24T14:15:00Z",
    updatedAt: "2024-11-24T14:15:00Z",
  },
  {
    id: "var-binom-002",
    clusterId: "clust-binomial",
    questionText: "Berechne: (2x - 5)²",
    createdAt: "2024-11-24T14:16:00Z",
    updatedAt: "2024-11-24T14:16:00Z",
  },
  {
    id: "var-binom-003",
    clusterId: "clust-binomial",
    questionText: "Berechne: (x + 4)(x - 4)",
    createdAt: "2024-11-24T14:17:00Z",
    updatedAt: "2024-11-24T14:17:00Z",
  },
  // Terme vereinfachen
  {
    id: "var-term-001",
    clusterId: "clust-term-simp",
    questionText: "Vereinfache: 3x + 5x - 2x",
    createdAt: "2024-11-23T10:45:00Z",
    updatedAt: "2024-11-23T10:45:00Z",
  },
  {
    id: "var-term-002",
    clusterId: "clust-term-simp",
    questionText: "Vereinfache: 4a · 3b · 2",
    createdAt: "2024-11-23T10:46:00Z",
    updatedAt: "2024-11-23T10:46:00Z",
  },
];

export const mockAnswers: Answer[] = [
  // Antworten für var-lin-001 (2x + 3 = 7 → x = 2)
  {
    id: "ans-lin-001-a",
    variantId: "var-lin-001",
    answerText: "x = 2",
    isCorrect: true,
    createdAt: "2024-11-22T10:15:00Z",
    updatedAt: "2024-11-22T10:15:00Z",
  },
  {
    id: "ans-lin-001-b",
    variantId: "var-lin-001",
    answerText: "x = 5",
    isCorrect: false,
    distractorType: "calculation_error",
    createdAt: "2024-11-22T10:15:00Z",
    updatedAt: "2024-11-22T10:15:00Z",
  },
  {
    id: "ans-lin-001-c",
    variantId: "var-lin-001",
    answerText: "x = -2",
    isCorrect: false,
    distractorType: "sign_error",
    createdAt: "2024-11-22T10:15:00Z",
    updatedAt: "2024-11-22T10:15:00Z",
  },
  {
    id: "ans-lin-001-d",
    variantId: "var-lin-001",
    answerText: "x = 4",
    isCorrect: false,
    distractorType: "common_mistake",
    createdAt: "2024-11-22T10:15:00Z",
    updatedAt: "2024-11-22T10:15:00Z",
  },
  // Antworten für var-lin-002 (4x - 1 = 11 → x = 3)
  {
    id: "ans-lin-002-a",
    variantId: "var-lin-002",
    answerText: "x = 3",
    isCorrect: true,
    createdAt: "2024-11-22T10:16:00Z",
    updatedAt: "2024-11-22T10:16:00Z",
  },
  {
    id: "ans-lin-002-b",
    variantId: "var-lin-002",
    answerText: "x = 2.5",
    isCorrect: false,
    distractorType: "calculation_error",
    createdAt: "2024-11-22T10:16:00Z",
    updatedAt: "2024-11-22T10:16:00Z",
  },
  {
    id: "ans-lin-002-c",
    variantId: "var-lin-002",
    answerText: "x = -3",
    isCorrect: false,
    distractorType: "sign_error",
    createdAt: "2024-11-22T10:16:00Z",
    updatedAt: "2024-11-22T10:16:00Z",
  },
  {
    id: "ans-lin-002-d",
    variantId: "var-lin-002",
    answerText: "x = 4",
    isCorrect: false,
    distractorType: "common_mistake",
    createdAt: "2024-11-22T10:16:00Z",
    updatedAt: "2024-11-22T10:16:00Z",
  },
  // Antworten für var-quad-001 (x² - 5x + 6 = 0 → x = 2 oder x = 3)
  {
    id: "ans-quad-001-a",
    variantId: "var-quad-001",
    answerText: "x₁ = 2, x₂ = 3",
    isCorrect: true,
    createdAt: "2024-11-22T11:15:00Z",
    updatedAt: "2024-11-22T11:15:00Z",
  },
  {
    id: "ans-quad-001-b",
    variantId: "var-quad-001",
    answerText: "x₁ = -2, x₂ = -3",
    isCorrect: false,
    distractorType: "sign_error",
    createdAt: "2024-11-22T11:15:00Z",
    updatedAt: "2024-11-22T11:15:00Z",
  },
  {
    id: "ans-quad-001-c",
    variantId: "var-quad-001",
    answerText: "x₁ = 1, x₂ = 6",
    isCorrect: false,
    distractorType: "factoring_error",
    createdAt: "2024-11-22T11:15:00Z",
    updatedAt: "2024-11-22T11:15:00Z",
  },
  {
    id: "ans-quad-001-d",
    variantId: "var-quad-001",
    answerText: "x = 5",
    isCorrect: false,
    distractorType: "incomplete_solution",
    createdAt: "2024-11-22T11:15:00Z",
    updatedAt: "2024-11-22T11:15:00Z",
  },
  // Antworten für var-binom-001 ((a + 3)² = a² + 6a + 9)
  {
    id: "ans-binom-001-a",
    variantId: "var-binom-001",
    answerText: "a² + 6a + 9",
    isCorrect: true,
    createdAt: "2024-11-24T14:15:00Z",
    updatedAt: "2024-11-24T14:15:00Z",
  },
  {
    id: "ans-binom-001-b",
    variantId: "var-binom-001",
    answerText: "a² + 9",
    isCorrect: false,
    distractorType: "missing_middle_term",
    createdAt: "2024-11-24T14:15:00Z",
    updatedAt: "2024-11-24T14:15:00Z",
  },
  {
    id: "ans-binom-001-c",
    variantId: "var-binom-001",
    answerText: "a² + 3a + 9",
    isCorrect: false,
    distractorType: "coefficient_error",
    createdAt: "2024-11-24T14:15:00Z",
    updatedAt: "2024-11-24T14:15:00Z",
  },
  {
    id: "ans-binom-001-d",
    variantId: "var-binom-001",
    answerText: "2a + 6",
    isCorrect: false,
    distractorType: "conceptual_error",
    createdAt: "2024-11-24T14:15:00Z",
    updatedAt: "2024-11-24T14:15:00Z",
  },
  // Antworten für var-term-001 (3x + 5x - 2x = 6x)
  {
    id: "ans-term-001-a",
    variantId: "var-term-001",
    answerText: "6x",
    isCorrect: true,
    createdAt: "2024-11-23T10:45:00Z",
    updatedAt: "2024-11-23T10:45:00Z",
  },
  {
    id: "ans-term-001-b",
    variantId: "var-term-001",
    answerText: "8x",
    isCorrect: false,
    distractorType: "calculation_error",
    createdAt: "2024-11-23T10:45:00Z",
    updatedAt: "2024-11-23T10:45:00Z",
  },
  {
    id: "ans-term-001-c",
    variantId: "var-term-001",
    answerText: "10x",
    isCorrect: false,
    distractorType: "sign_error",
    createdAt: "2024-11-23T10:45:00Z",
    updatedAt: "2024-11-23T10:45:00Z",
  },
  {
    id: "ans-term-001-d",
    variantId: "var-term-001",
    answerText: "6x³",
    isCorrect: false,
    distractorType: "exponent_error",
    createdAt: "2024-11-23T10:45:00Z",
    updatedAt: "2024-11-23T10:45:00Z",
  },
];

// Helper functions
export function getSubjectById(id: string): Subject | undefined {
  return mockSubjects.find((s) => s.id === id);
}

export function getClustersBySubject(subjectId: string): QuestionCluster[] {
  return mockClusters.filter((c) => c.subjectId === subjectId);
}

export function getClusterById(id: string): QuestionCluster | undefined {
  return mockClusters.find((c) => c.id === id);
}

export function getVariantsByCluster(clusterId: string): QuestionVariant[] {
  return mockVariants.filter((v) => v.clusterId === clusterId);
}

export function getVariantById(id: string): QuestionVariant | undefined {
  return mockVariants.find((v) => v.id === id);
}

export function getAnswersByVariant(variantId: string): Answer[] {
  return mockAnswers.filter((a) => a.variantId === variantId);
}

export function getAnswerById(id: string): Answer | undefined {
  return mockAnswers.find((a) => a.id === id);
}
