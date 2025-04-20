import { useState, useCallback } from "react";
import { PROMPT_QUESTIONS } from "../lib/constants";
import debounce from "lodash/debounce";

interface PromptQuestionsProps {
  onAnswersChange: (answers: Record<string, string>) => void;
}

export function PromptQuestions({ onAnswersChange }: PromptQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({
    description: "",
    achievements: "",
    quirks: "",
  });

  const [charCounts, setCharCounts] = useState<Record<string, number>>({
    description: 0,
    achievements: 0,
    quirks: 0,
  });

  // Debounce the callback to prevent too frequent updates
  const debouncedCallback = useCallback(
    debounce((newAnswers: Record<string, string>) => {
      onAnswersChange(newAnswers);
    }, 300),
    [onAnswersChange]
  );

  const handleAnswerChange = (questionId: string, value: string) => {
    const question = PROMPT_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    if (value.length <= question.maxLength) {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);
      setCharCounts((prev) => ({ ...prev, [questionId]: value.length }));
      debouncedCallback(newAnswers);
    }
  };

  const validateAnswers = () => {
    return Object.values(answers).every((answer) => answer.trim().length > 0);
  };

  const getCharCountClass = (count: number, maxLength: number) => {
    const percentage = (count / maxLength) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      {PROMPT_QUESTIONS.map((question) => (
        <div key={question.id} className="space-y-2">
          <label
            htmlFor={question.id}
            className="block text-sm font-medium text-gray-700"
          >
            {question.label}
          </label>
          <textarea
            id={question.id}
            value={answers[question.id]}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={3}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            aria-label={question.label}
            aria-required="true"
            aria-describedby={`${question.id}-hint`}
          />
          <div className="flex justify-between text-xs">
            <span className="text-red-600">
              {answers[question.id].length === 0 && "Required"}
            </span>
            <span
              id={`${question.id}-hint`}
              className={getCharCountClass(
                charCounts[question.id],
                question.maxLength
              )}
            >
              {charCounts[question.id]}/{question.maxLength}
              {charCounts[question.id] >= question.maxLength * 0.9 &&
                " - Almost at limit!"}
              {charCounts[question.id] >= question.maxLength * 0.75 &&
                charCounts[question.id] < question.maxLength * 0.9 &&
                " - Getting close!"}
            </span>
          </div>
        </div>
      ))}
      {!validateAnswers() && (
        <p className="text-sm text-red-600" role="alert">
          Please answer all questions
        </p>
      )}
    </div>
  );
}
