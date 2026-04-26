import { useState, useCallback } from 'react';
import { ArrowLeft, Heart, Send, MessageCircle, Lightbulb, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { entities } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/PullToRefresh';
import MobileSelect from '@/components/MobileSelect';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: MessageCircle },
  { key: 'success_story', label: 'Success', icon: PartyPopper },
  { key: 'study_tip', label: 'Tips', icon: Lightbulb },
  { key: 'encouragement', label: 'Support', icon: Heart },
];

const CATEGORY_STYLES = {
  success_story: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', tag: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300', emoji: '🎉' },
  study_tip: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', tag: 'bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300', emoji: '💡' },
  encouragement: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', tag: 'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300', emoji: '💪' },
};

function StoryCard({ story, onLike }) {
  const style = CATEGORY_STYLES[story.category] || CATEGORY_STYLES.encouragement;
  return (
    <div className={`${style.bg} border ${style.border} rounded-2xl p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.emoji}</span>
          <span className="text-xs font-bold text-foreground">{story.author_name || 'Anonymous'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${style.tag}`}>
            {story.category === 'success_story' ? 'Success' : story.category === 'study_tip' ? 'Tip' : 'Support'}
          </span>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{story.content}</p>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onLike(story)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Heart className="w-3.5 h-3.5" /> {story.likes || 0}
        </button>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {new Date(story.created_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function Community() {
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: '', content: '', category: 'encouragement' });
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['community_stories'],
    queryFn: () => entities.CommunityStory.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => entities.CommunityStory.create(data),
    onMutate: async (newStory) => {
      await queryClient.cancelQueries({ queryKey: ['community_stories'] });
      const previous = queryClient.getQueryData(['community_stories']);
      const optimistic = {
        ...newStory,
        id: 'temp-' + Date.now(),
        created_date: new Date().toISOString(),
        likes: 0,
      };
      queryClient.setQueryData(['community_stories'], (old = []) => [optimistic, ...old]);
      setShowForm(false);
      setForm({ author_name: '', content: '', category: 'encouragement' });
      return { previous };
    },
    onError: (_err, _newStory, context) => {
      queryClient.setQueryData(['community_stories'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community_stories'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (story) => entities.CommunityStory.update(story.id, { likes: (story.likes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community_stories'] }),
  });

  const filtered = filter === 'all' ? stories : stories.filter(s => s.category === filter);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['community_stories'] });
  }, [queryClient]);

  const filterOptions = CATEGORIES.map(c => ({ value: c.key, label: c.label, icon: c.icon }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    createMutation.mutate({ ...form, content: form.content.slice(0, 280) });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-4 md:gap-5 pb-24 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base font-bold text-foreground">Community</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full"
        >
          + Share
        </button>
      </div>

      {/* Post Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mx-4 md:mx-0 bg-card border border-border rounded-2xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={form.author_name}
            onChange={e => setForm({ ...form, author_name: e.target.value })}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <textarea
            placeholder="Share your story, tip, or encouragement... (280 chars max)"
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value.slice(0, 280) })}
            maxLength={280}
            rows={3}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />
          <div className="flex gap-2">
            {['encouragement', 'study_tip', 'success_story'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  form.category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {cat === 'success_story' ? '🎉 Success' : cat === 'study_tip' ? '💡 Tip' : '💪 Support'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{form.content.length}/280</span>
            <button
              type="submit"
              disabled={!form.content.trim() || createMutation.isPending}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="px-4 md:px-0 overflow-x-auto">
        <MobileSelect
          value={filter}
          onValueChange={setFilter}
          options={filterOptions}
          title="Filter Stories"
        />
      </div>

      {/* Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-4 md:px-0">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No stories yet. Be the first to share!</p>
          </div>
        )}
        {filtered.map(story => (
          <StoryCard key={story.id} story={story} onLike={(s) => likeMutation.mutate(s)} />
        ))}
      </div>
    </PullToRefresh>
  );
}