import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Tab = 'Hoje' | 'Plano' | 'Perfil';
type Goal = 'Perder peso' | 'Manter rotina' | 'Criar hábitos';

const goals: Goal[] = ['Perder peso', 'Manter rotina', 'Criar hábitos'];
const activities = ['Pouco ativo', 'Em movimento', 'Ativo'];
const meals = [
  ['Café da manhã', 'Combine uma fruta, um alimento integral e uma fonte de proteína que faça sentido para você.'],
  ['Almoço', 'Inclua legumes ou verduras, uma leguminosa, um cereal e uma fonte de proteína.'],
  ['Lanche', 'Deixe opções simples por perto, como frutas, iogurte natural ou castanhas.'],
  ['Jantar', 'Priorize uma refeição caseira e faça pausas para perceber fome e saciedade.'],
];
const habits = [
  ['Planejar uma refeição caseira', 'Decida antes da fome chegar.'],
  ['Adicionar cor ao prato', 'Inclua frutas, legumes ou verduras em uma refeição.'],
  ['Movimentar o corpo', 'Escolha uma atividade que combine com seu momento.'],
];

function getHabitStorageKey() {
  return `@vivaleve/habits/${new Date().toLocaleDateString('sv-SE')}`;
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>('Hoje');
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [goalChange, setGoalChange] = useState('');
  const [goal, setGoal] = useState<Goal>('Criar hábitos');
  const [activity, setActivity] = useState('Em movimento');
  const [needsCare, setNeedsCare] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<number[]>([]);
  const [habitsLoaded, setHabitsLoaded] = useState(false);
  const firstName = name.trim().split(' ')[0] || 'você';
  const weeklyFocus = useMemo(() => {
    if (goal === 'Perder peso') return 'Construir mudanças sustentáveis, sem atalhos.';
    if (goal === 'Manter rotina') return 'Manter constância nas escolhas do dia a dia.';
    return 'Criar uma rotina que caiba na sua vida.';
  }, [goal]);

  if (!started) return (
    <SafeAreaView style={s.safe}><StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.onboarding} keyboardShouldPersistTaps="handled">
        <View style={s.brand}><View style={s.logo}><Text style={s.logoText}>V</Text></View><Text style={s.brandText}>VivaLeve</Text></View>
        <Text style={s.kicker}>SEU BEM-ESTAR, COM MAIS LEVEZA</Text>
        <Text style={s.hero}>Vamos criar uma rotina possível?</Text>
        <Text style={s.lead}>Conte um pouco sobre sua meta. Você receberá sugestões educativas para começar com mais organização.</Text>
        <Field label="Como podemos te chamar?" value={name} onChange={setName} placeholder="Seu primeiro nome" />
        <Text style={s.label}>Qual é seu foco agora?</Text><View style={s.chips}>{goals.map((item) => <Chip key={item} label={item} selected={goal === item} onPress={() => setGoal(item)} />)}</View>
        <View style={s.columns}><View style={s.column}><Field label="Peso atual (kg)" value={weight} onChange={setWeight} placeholder="Ex.: 72" numeric /></View><View style={s.column}><Field label="Meta de mudança (kg)" value={goalChange} onChange={setGoalChange} placeholder="Opcional" numeric /></View></View>
        <Text style={s.label}>Como é seu nível de movimento?</Text><View style={s.chips}>{activities.map((item) => <Chip key={item} label={item} selected={activity === item} onPress={() => setActivity(item)} />)}</View>
        <Pressable style={s.checkRow} onPress={() => setNeedsCare(!needsCare)}><View style={[s.box, needsCare && s.boxActive]}>{needsCare && <Text style={s.tick}>✓</Text>}</View><Text style={s.checkText}>Tenho condição de saúde, alergia, gestação ou outra necessidade alimentar específica.</Text></Pressable>
        <Notice title="Importante" text="O VivaLeve é educativo e não substitui nutricionista ou médico. Para necessidades específicas, o acompanhamento profissional é essencial." />
        <Pressable style={s.button} onPress={() => setStarted(true)}><Text style={s.buttonText}>Criar meu roteiro</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}><StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.screen}>
        <View style={s.header}><View><Text style={s.greeting}>Olá, {firstName}.</Text><Text style={s.subGreeting}>Um passo de cada vez.</Text></View><View style={s.avatar}><Text style={s.avatarText}>{firstName[0].toUpperCase()}</Text></View></View>
        {tab === 'Hoje' && <><View style={s.focusCard}><Text style={s.eyebrow}>FOCO DA SEMANA</Text><Text style={s.focusTitle}>{weeklyFocus}</Text><Text style={s.focusText}>Escolha refeições variadas, faça pausas e priorize constância em vez de perfeição.</Text></View><Text style={s.title}>Pequenos passos de hoje</Text><Habit label="Planejar uma refeição caseira" text="Decida antes da fome chegar." /><Habit label="Adicionar cor ao prato" text="Inclua frutas, legumes ou verduras em uma refeição." /><Habit label="Movimentar o corpo" text={`Escolha uma atividade que combine com seu momento: ${activity.toLowerCase()}.`} /></>}
        {tab === 'Plano' && <><Text style={s.title}>Seu roteiro alimentar</Text><Text style={s.lead}>Sugestões flexíveis que respeitam hábitos, cultura e acesso aos alimentos.</Text>{meals.map(([time, idea]) => <View style={s.meal} key={time}><Text style={s.mealTime}>{time.toUpperCase()}</Text><Text style={s.mealText}>{idea}</Text></View>)}</>}
        {tab === 'Perfil' && <><Text style={s.title}>Seu ponto de partida</Text><View style={s.profile}><Row label="Objetivo" value={goal} /><Row label="Movimento" value={activity} /><Row label="Peso informado" value={weight ? `${weight} kg` : 'Não informado'} /><Row label="Meta informada" value={goalChange ? `${goalChange} kg` : 'Não informada'} /></View>{needsCare ? <Notice title="Plano profissional recomendado" text="Como você indicou uma necessidade específica, use este app apenas para organização e procure um profissional de saúde para orientações individualizadas." warning /> : <Notice title="Seu plano é um ponto de partida" text="A alimentação saudável é diversa e individual. Ajustes clínicos devem ser feitos com profissional habilitado." />}</>}
      </ScrollView>
      <View style={s.tabs}>{(['Hoje', 'Plano', 'Perfil'] as Tab[]).map((item) => <Pressable key={item} style={s.tab} onPress={() => setTab(item)}><Text style={[s.tabText, tab === item && s.tabActive]}>{item}</Text>{tab === item && <View style={s.indicator} />}</Pressable>)}</View>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, numeric = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; numeric?: boolean }) {
  return <><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={onChange} keyboardType={numeric ? 'decimal-pad' : 'default'} placeholder={placeholder} placeholderTextColor="#8B9B92" style={s.input} /></>;
}
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable style={[s.chip, selected && s.chipSelected]} onPress={onPress}><Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text></Pressable>; }
function Habit({ label, text }: { label: string; text: string }) { return <View style={s.habit}><View style={s.habitIcon}><Text style={s.tick}>✓</Text></View><View style={s.habitCopy}><Text style={s.habitLabel}>{label}</Text><Text style={s.habitText}>{text}</Text></View></View>; }
function Row({ label, value }: { label: string; value: string }) { return <View style={s.row}><Text style={s.rowLabel}>{label}</Text><Text style={s.rowValue}>{value}</Text></View>; }
function Notice({ title, text, warning = false }: { title: string; text: string; warning?: boolean }) { return <View style={[s.notice, warning && s.warning]}><Text style={[s.noticeTitle, warning && s.warningTitle]}>{title}</Text><Text style={[s.noticeText, warning && s.warningText]}>{text}</Text></View>; }

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFBF7' }, onboarding: { padding: 24, paddingBottom: 44 }, screen: { padding: 24, paddingBottom: 110 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 42 }, logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2C6E49', alignItems: 'center', justifyContent: 'center' }, logoText: { color: '#fff', fontSize: 19, fontWeight: '800' }, brandText: { color: '#1D3327', fontSize: 21, fontWeight: '800' },
  kicker: { color: '#5E8270', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 }, hero: { color: '#183124', fontSize: 35, lineHeight: 42, fontWeight: '800' }, lead: { color: '#587060', fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 12 },
  label: { color: '#345341', fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#D9E4DA', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 15, height: 51, color: '#1D3327', fontSize: 16 }, columns: { flexDirection: 'row', gap: 12 }, column: { flex: 1 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderWidth: 1, borderColor: '#D9E4DA', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 99, backgroundColor: '#fff' }, chipSelected: { borderColor: '#2C6E49', backgroundColor: '#E4F1E7' }, chipText: { color: '#5A7160', fontSize: 13, fontWeight: '700' }, chipTextSelected: { color: '#205C3C' },
  checkRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', marginTop: 25 }, box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#9AB0A0', alignItems: 'center', justifyContent: 'center', marginTop: 1 }, boxActive: { backgroundColor: '#2C6E49', borderColor: '#2C6E49' }, tick: { color: '#fff', fontWeight: '800', fontSize: 13 }, checkText: { flex: 1, color: '#526B5A', fontSize: 13, lineHeight: 19 },
  notice: { backgroundColor: '#EFF6E9', borderRadius: 15, padding: 16, marginTop: 24 }, noticeTitle: { color: '#285735', fontSize: 14, fontWeight: '800', marginBottom: 5 }, noticeText: { color: '#496653', fontSize: 13, lineHeight: 19 }, warning: { backgroundColor: '#FFF3DF' }, warningTitle: { color: '#8A5412' }, warningText: { color: '#765B35' }, button: { backgroundColor: '#2C6E49', height: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 27 }, greeting: { color: '#183124', fontSize: 27, fontWeight: '800' }, subGreeting: { color: '#6E8373', fontSize: 14, marginTop: 3 }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DDEFE0', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#2C6E49', fontWeight: '800', fontSize: 17 },
  focusCard: { backgroundColor: '#2C6E49', borderRadius: 22, padding: 22, marginBottom: 27 }, eyebrow: { color: '#C7E3CD', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }, focusTitle: { color: '#fff', fontSize: 23, lineHeight: 29, fontWeight: '800', marginTop: 8 }, focusText: { color: '#D9EBDD', fontSize: 14, lineHeight: 20, marginTop: 10 }, title: { color: '#213B2A', fontSize: 21, fontWeight: '800' }, habit: { flexDirection: 'row', gap: 13, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5ECE5' }, habitIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7ABF8E', alignItems: 'center', justifyContent: 'center', marginTop: 2 }, habitCopy: { flex: 1 }, habitLabel: { color: '#294432', fontSize: 15, fontWeight: '800' }, habitText: { color: '#6C806F', fontSize: 13, lineHeight: 19, marginTop: 3 },
  meal: { backgroundColor: '#fff', borderRadius: 17, borderWidth: 1, borderColor: '#E3EBE2', padding: 17, marginTop: 11 }, mealTime: { color: '#679077', fontSize: 11, fontWeight: '800', letterSpacing: .8 }, mealText: { color: '#294432', fontSize: 15, lineHeight: 21, fontWeight: '600', marginTop: 7 }, profile: { backgroundColor: '#fff', borderRadius: 17, borderWidth: 1, borderColor: '#E3EBE2', paddingHorizontal: 17, marginTop: 18 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E9EFE9' }, rowLabel: { color: '#6D8172', fontSize: 13 }, rowValue: { color: '#294432', fontSize: 13, fontWeight: '800', textAlign: 'right', flexShrink: 1 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E6EDE6', paddingHorizontal: 15, paddingBottom: 15, paddingTop: 10 }, tab: { flex: 1, alignItems: 'center', gap: 7, paddingVertical: 4 }, tabText: { color: '#7A8D7E', fontSize: 13, fontWeight: '700' }, tabActive: { color: '#2C6E49' }, indicator: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2C6E49' },
});
