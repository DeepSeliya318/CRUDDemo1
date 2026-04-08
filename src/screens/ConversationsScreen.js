import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { fetchConversations } from '../api/chatApi';

function normalizeId(value) {
  const v = value?.id ?? value?._id ?? value;
  return v?.toString?.() ?? '';
}

function getConversationTitle(conversation, meId) {
  if (!conversation) return 'Conversation';
  if (conversation.isGroup && conversation.name) return conversation.name;
  console.log("000000",conversation)

  const parts = Array.isArray(conversation.participants)
    ? conversation.participants
    : [];
  const me = normalizeId(meId);
  const other = parts.find(p => normalizeId(p) !== me);
  return other?.name || other?.email || 'Chat';
}

const ConversationsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);

  const meId = normalizeId(user?.id ?? user?._id);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchConversations({ page: 1, limit: 30 });
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      load();
    });
    return unsub;
  }, [navigation]);

  const filteredItems = items.filter(c => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const title = getConversationTitle(c, meId)?.toLowerCase?.() || '';
    const last = c?.lastMessage?.text?.toLowerCase?.() || '';
    return title.includes(q) || last.includes(q);
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075e54" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              setSearchOpen(v => !v);
              if (searchOpen) setQuery('');
            }}
          >
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Users')}
          >
            <Text style={styles.headerIcon}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {searchOpen ? (
        <View style={styles.searchWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats"
            placeholderTextColor="#9aa"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : null}

      {filteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySub}>Tap below to start a new chat</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Users')}
          >
            <Text style={styles.emptyBtnText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item._id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => {
            const title = getConversationTitle(item, meId);
            const last = item?.lastMessage?.text;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('Chat', { conversation: item })
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(title?.charAt?.(0) || '?').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.meta}>
                  <Text style={styles.name} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.last} numberOfLines={1}>
                    {last || 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={styles.fabText}>✉</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#075e54',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerIcon: {
    fontSize: 18,
    color: '#075e54',
    fontWeight: '700',
  },
  searchWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    color: '#111',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  sep: { height: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e3f2f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#075e54',
    fontWeight: '800',
    fontSize: 16,
  },
  meta: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  last: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#667',
    marginBottom: 14,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: '#075e54',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
});

export default ConversationsScreen;
