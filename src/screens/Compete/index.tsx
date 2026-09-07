import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, radius } from '@/constants/theme';

type Run = {
  id: string;
  created_at: string;
  total_time: number | string | null;
  notes: string | null;
};

export function CompeteScreen() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [total_time, set_total_time] = useState('');
  const [catch_type, set_catch_type] = useState('legal');
  const [barrier_broken, set_barrier_broken] = useState(false);
  const [tie_held, set_tie_held] = useState(false);
  const [notes, set_notes] = useState('');

  const loadRuns = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tiedown_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setRuns((data as Run[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  const resetForm = () => {
    set_total_time('');
    set_catch_type('legal');
    set_barrier_broken(false);
    set_tie_held(false);
    set_notes('');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      total_time: total_time ? Number(total_time) : null,
      catch_type,
      barrier_broken,
      tie_held,
      notes: notes || null,
    };
    const { error } = await supabase.from('tiedown_runs').insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    resetForm();
    setShowForm(false);
    loadRuns();
  };

  return (
    <ScrollView style={cs.container} contentContainerStyle={cs.content}>
      <View style={cs.headerRow}>
        <Text style={cs.title}>Practice log</Text>
        <TouchableOpacity style={cs.addBtn} onPress={() => setShowForm((v) => !v)}>
          <Text style={cs.addBtnText}>{showForm ? 'Close' : '+ Log run'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={cs.sub}>
        Hand-timed tie-down roping runs stay yours — they are structurally separated from official results and never reach a
        leaderboard.
      </Text>

      {showForm && (
        <View style={cs.form}>
        <View style={cs.field}>
          <Text style={cs.label}>Total time (s)</Text>
          <TextInput
            style={cs.input}
            value={total_time}
            onChangeText={set_total_time}
            keyboardType={'numeric'}
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={cs.field}>
          <Text style={cs.label}>Catch type</Text>
          <View style={cs.chips}>
            {(['legal', 'two_hind_legs', 'neck', 'no_catch'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[cs.chip, catch_type === opt && cs.chipActive]}
                onPress={() => set_catch_type(opt)}
              >
                <Text style={[cs.chipText, catch_type === opt && cs.chipTextActive]}>{opt.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={cs.toggleRow}>
          <Text style={cs.label}>Barrier broken</Text>
          <Switch value={barrier_broken} onValueChange={set_barrier_broken} trackColor={{ true: colors.accent }} />
        </View>
        <View style={cs.toggleRow}>
          <Text style={cs.label}>Tie held (6s)</Text>
          <Switch value={tie_held} onValueChange={set_tie_held} trackColor={{ true: colors.accent }} />
        </View>
        <View style={cs.field}>
          <Text style={cs.label}>Notes</Text>
          <TextInput
            style={cs.input}
            value={notes}
            onChangeText={set_notes}
            placeholder=""
            placeholderTextColor={colors.muted}
            multiline
          />
        </View>
          <TouchableOpacity style={[cs.saveBtn, saving && cs.disabled]} onPress={handleSave} disabled={saving}>
            <Text style={cs.saveBtnText}>{saving ? 'Saving…' : 'Save run'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={cs.analyzeBtn} onPress={() => router.push('/analyze')}>
        <Text style={cs.analyzeBtnText}>⭐ Analyze a video</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : runs.length === 0 ? (
        <Text style={cs.empty}>Nothing logged yet. Log your first tie-down roping run above.</Text>
      ) : (
        runs.map((run) => (
          <View key={run.id} style={cs.runCard}>
            <Text style={cs.runPrimary}>{String(run.total_time ?? '—')}</Text>
            <Text style={cs.runDate}>{new Date(run.created_at).toLocaleDateString()}</Text>
            {run.notes ? <Text style={cs.runNotes}>{run.notes}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const cs = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenX, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  addBtn: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  form: { backgroundColor: colors.card, borderRadius: radius.card, padding: spacing.cardPad, gap: 14, borderWidth: 1, borderColor: colors.border },
  field: { gap: 6 },
  label: { fontSize: 14, color: colors.text, fontWeight: '600' },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.control, padding: 12, color: colors.text, fontSize: 15 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.control, padding: 15, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  analyzeBtn: { borderWidth: 1, borderColor: colors.accent, borderRadius: radius.control, padding: 14, alignItems: 'center' },
  analyzeBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24, fontSize: 14 },
  runCard: { backgroundColor: colors.card, borderRadius: radius.card, padding: spacing.cardPad, gap: 4, borderWidth: 1, borderColor: colors.border },
  runPrimary: { fontSize: 18, fontWeight: '700', color: colors.text },
  runDate: { fontSize: 12, color: colors.muted },
  runNotes: { fontSize: 14, color: colors.muted, marginTop: 4 },
});
