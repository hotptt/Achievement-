import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, Alert, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'life_achievements_v1';

function todayISO() {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}
function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('add'); // 'add' | 'list'

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) { try { setRecords(JSON.parse(raw)); } catch { setRecords([]); } }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...records].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!q) return list;
    return list.filter(r =>
      [r.title, r.description, r.date].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [records, query]);

  function addRecord() {
    if (!title.trim()) return Alert.alert('업적 제목을 입력하세요');
    const item = { id: uid(), title: title.trim(), description: description.trim() || undefined, date };
    setRecords(prev => [item, ...prev]);
    setTitle(''); setDescription(''); setDate(todayISO()); setTab('list');
  }

  function removeRecord(id) {
    Alert.alert('삭제할까요?', '', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setRecords(prev => prev.filter(r => r.id !== id)) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
      <StatusBar hidden />
      <View style={{ paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 8 : 0, paddingBottom: 8 }}>
        <Text style={{ color: '#f6f6f7', fontSize: 20, fontWeight: '700' }}>인생 업적 기록</Text>
        <Text style={{ color: '#9aa0a6', marginTop: 4, fontSize: 12 }}>한 시기의 증거, 다시는 돌아오지 않을 순간들.</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        {['add', 'list'].map(k => (
          <TouchableOpacity
            key={k}
            onPress={() => setTab(k)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 12,
              backgroundColor: tab === k ? '#1f1f22' : '#121214',
              alignItems: 'center', borderWidth: 1, borderColor: '#232327'
            }}>
            <Text style={{ color: '#e6e6e7', fontSize: 14 }}>{k === 'add' ? '추가' : '업적 모아보기'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'add' && (
        <View style={{ flex: 1, padding: 16, gap: 10 }}>
          <Input label="업적 제목 *" value={title} onChangeText={setTitle} placeholder="예: 군 복무 완수, 첫 자격증 취득" />
          <Input label="설명" value={description} onChangeText={setDescription} placeholder="과정/의미 등" multiline />
          <Input label="날짜" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <TouchableOpacity onPress={addRecord} style={{ backgroundColor: '#2f81f7', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>기록 저장</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'list' && (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
          <Input label="검색" value={query} onChangeText={setQuery} placeholder="제목/설명/날짜" />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 8, gap: 10 }}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: '#121214', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#232327' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#e6e6e7', fontSize: 16, fontWeight: '700' }}>{item.title}</Text>
                  <TouchableOpacity onPress={() => removeRecord(item.id)}>
                    <Text style={{ color: '#ef5350' }}>삭제</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: '#9aa0a6', marginTop: 4 }}>{item.date}</Text>
                {!!item.description && <Text style={{ color: '#c6c6c7', marginTop: 8, lineHeight: 20 }}>{item.description}</Text>}
              </View>
            )}
            ListEmptyComponent={
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#9aa0a6' }}>아직 남긴 인생의 흔적이 없다.</Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function Input({ label, multiline, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: '#c6c6c7', fontSize: 12 }}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#6b7280"
        style={{
          backgroundColor: '#121214',
          color: '#f0f0f1',
          borderRadius: 12,
          paddingVertical: multiline ? 10 : 12,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: '#232327',
          minHeight: multiline ? 80 : undefined,
        }}
      />
    </View>
  );
}
