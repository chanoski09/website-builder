import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { entities } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import N400Part1 from '@/components/n400/N400Part1';
import N400Part2 from '@/components/n400/N400Part2';
import N400Part3 from '@/components/n400/N400Part3';
import N400Part4And5 from '@/components/n400/N400Part4And5';
import N400Part6And7 from '@/components/n400/N400Part6And7';
import N400Part8 from '@/components/n400/N400Part8';
import N400Part9 from '@/components/n400/N400Part9';

const SECTIONS = [
  { key: 'part1', label: 'Part 1: Eligibility' },
  { key: 'part2', label: 'Part 2: About You' },
  { key: 'part3', label: 'Part 3: Biographic Info' },
  { key: 'part4_5', label: 'Parts 4-5: Residence & Marriage' },
  { key: 'part6_7', label: 'Parts 6-7: Children & Employment' },
  { key: 'part8', label: 'Part 8: Time Outside U.S.' },
  { key: 'part9', label: 'Part 9: Additional Info & Oath' },
];

export default function N400Form() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('part1');
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['n400form'],
    queryFn: async () => {
      const results = await entities.N400Form.list('-created_date', 1);
      return results[0] || null;
    },
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_date, updated_date, created_by, ...cleanData } = data;
      if (existing?.id) {
        return entities.N400Form.update(existing.id, cleanData);
      } else {
        return entities.N400Form.create(cleanData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n400form'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const sectionProps = { form, updateField };

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-4 md:gap-5 pb-24 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base font-bold text-foreground">N-400 Form Info</h2>
        <div className="w-9" />
      </div>

      {/* Info */}
      <div className="mx-4 md:mx-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
          📋 Fill in your N-400 details so the mock interview can ask personalized questions based on your application. This follows the official USCIS Form N-400 (Edition 01/20/25).
        </p>
      </div>

      {/* Section tabs */}
      <div className="px-4 md:px-0 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeSection === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active section */}
      <div className="mx-4 md:mx-0 md:max-w-3xl md:w-full">
        {activeSection === 'part1' && <N400Part1 {...sectionProps} />}
        {activeSection === 'part2' && <N400Part2 {...sectionProps} />}
        {activeSection === 'part3' && <N400Part3 {...sectionProps} />}
        {activeSection === 'part4_5' && <N400Part4And5 {...sectionProps} />}
        {activeSection === 'part6_7' && <N400Part6And7 {...sectionProps} />}
        {activeSection === 'part8' && <N400Part8 {...sectionProps} />}
        {activeSection === 'part9' && <N400Part9 {...sectionProps} />}
      </div>

      {/* Save button - fixed */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-5xl px-4 md:px-8 z-40">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
        >
          {saveMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Information</>
          )}
        </button>
      </div>
    </div>
  );
}