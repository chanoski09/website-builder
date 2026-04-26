import { useState, useEffect, useCallback } from 'react';
import { invokeProxy } from '@/api/supabaseClient';

// Cache for translated answers
const translationCache = {};

export function useLanguage() {
  const [translatedLang, setTranslatedLang] = useState(() => {
    return localStorage.getItem('civics_translate_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('civics_translate_lang', translatedLang);
  }, [translatedLang]);

  // Questions are always in English
  const getQuestion = (q) => q?.question_en || '';

  // Answers are always in English
  const getAnswer = (q) => q?.answer_en || '';

  // Get translated answer (async, uses LLM for non-hardcoded languages)
  const getTranslatedAnswer = useCallback(async (q) => {
    if (translatedLang === 'en') return null;

    const cacheKey = `${q.number}_${translatedLang}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    const result = await invokeProxy('invoke_llm', {
      prompt: `Translate this U.S. citizenship test answer to ${translatedLang} language code. Only return the translated text, nothing else.\n\nAnswer: "${q.answer_en}"`,
    });

    const translated = (typeof result === 'string' ? result : result?.text || result?.output || '').trim();
    translationCache[cacheKey] = translated;
    return translated;
  }, [translatedLang]);

  return { translatedLang, setTranslatedLang, getQuestion, getAnswer, getTranslatedAnswer };
}