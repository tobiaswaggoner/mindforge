"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  Subject,
  QuestionCluster,
  QuestionVariant,
  Answer,
  ContentSelection,
} from "@/types/content";
import {
  mockSubjects,
  mockClusters,
  mockVariants,
  mockAnswers,
} from "@/lib/mock-data/content";

interface ContentFilters {
  search: string;
  taskId: string | null;
  subjectId: string | null;
}

interface ContentContextType {
  // Data
  subjects: Subject[];
  clusters: QuestionCluster[];
  variants: QuestionVariant[];
  answers: Answer[];

  // Selection
  selection: ContentSelection | null;
  setSelection: (selection: ContentSelection | null) => void;

  // Filters
  filters: ContentFilters;
  setFilters: (filters: Partial<ContentFilters>) => void;

  // CRUD Operations
  updateSubject: (id: string, data: Partial<Subject>) => void;
  updateCluster: (id: string, data: Partial<QuestionCluster>) => void;
  updateVariant: (id: string, data: Partial<QuestionVariant>) => void;
  updateAnswer: (id: string, data: Partial<Answer>) => void;

  deleteSubject: (id: string) => void;
  deleteCluster: (id: string) => void;
  deleteVariant: (id: string) => void;
  deleteAnswer: (id: string) => void;

  // Helpers
  getClustersBySubject: (subjectId: string) => QuestionCluster[];
  getVariantsByCluster: (clusterId: string) => QuestionVariant[];
  getAnswersByVariant: (variantId: string) => Answer[];
  getSubjectById: (id: string) => Subject | undefined;
  getClusterById: (id: string) => QuestionCluster | undefined;
  getVariantById: (id: string) => QuestionVariant | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [clusters, setClusters] = useState<QuestionCluster[]>(mockClusters);
  const [variants, setVariants] = useState<QuestionVariant[]>(mockVariants);
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers);
  const [selection, setSelection] = useState<ContentSelection | null>(null);
  const [filters, setFiltersState] = useState<ContentFilters>({
    search: "",
    taskId: null,
    subjectId: null,
  });

  const setFilters = useCallback((newFilters: Partial<ContentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // CRUD Operations
  const updateSubject = useCallback((id: string, data: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);

  const updateCluster = useCallback(
    (id: string, data: Partial<QuestionCluster>) => {
      setClusters((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const updateVariant = useCallback(
    (id: string, data: Partial<QuestionVariant>) => {
      setVariants((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, ...data, updatedAt: new Date().toISOString() }
            : v
        )
      );
    },
    []
  );

  const updateAnswer = useCallback((id: string, data: Partial<Answer>) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setClusters((prev) => prev.filter((c) => c.subjectId !== id));
  }, []);

  const deleteCluster = useCallback((id: string) => {
    setClusters((prev) => prev.filter((c) => c.id !== id));
    setVariants((prev) => prev.filter((v) => v.clusterId !== id));
  }, []);

  const deleteVariant = useCallback((id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
    setAnswers((prev) => prev.filter((a) => a.variantId !== id));
  }, []);

  const deleteAnswer = useCallback((id: string) => {
    setAnswers((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Helpers
  const getClustersBySubject = useCallback(
    (subjectId: string) => {
      return clusters.filter((c) => c.subjectId === subjectId);
    },
    [clusters]
  );

  const getVariantsByCluster = useCallback(
    (clusterId: string) => {
      return variants.filter((v) => v.clusterId === clusterId);
    },
    [variants]
  );

  const getAnswersByVariant = useCallback(
    (variantId: string) => {
      return answers.filter((a) => a.variantId === variantId);
    },
    [answers]
  );

  const getSubjectById = useCallback(
    (id: string) => {
      return subjects.find((s) => s.id === id);
    },
    [subjects]
  );

  const getClusterById = useCallback(
    (id: string) => {
      return clusters.find((c) => c.id === id);
    },
    [clusters]
  );

  const getVariantById = useCallback(
    (id: string) => {
      return variants.find((v) => v.id === id);
    },
    [variants]
  );

  return (
    <ContentContext.Provider
      value={{
        subjects,
        clusters,
        variants,
        answers,
        selection,
        setSelection,
        filters,
        setFilters,
        updateSubject,
        updateCluster,
        updateVariant,
        updateAnswer,
        deleteSubject,
        deleteCluster,
        deleteVariant,
        deleteAnswer,
        getClustersBySubject,
        getVariantsByCluster,
        getAnswersByVariant,
        getSubjectById,
        getClusterById,
        getVariantById,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
