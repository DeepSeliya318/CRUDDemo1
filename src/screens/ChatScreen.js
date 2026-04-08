import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { fetchMessages } from '../api/chatApi';
import { getSocket, disconnectSocket } from '../api/socketClient';

function normalizeId(value) {
  const v = value?.id ?? value?._id ?? value;
  return v?.toString?.() ?? '';
}

const ChatScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const conversationId = conversation?._id;

  const { user } = useSelector(state => state.auth);
  const meId = normalizeId(user?.id ?? user?._id);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const listRef = useRef(null);
  const socketRef = useRef(null);

  // ✅ Hide the default navigator header — we use our own custom header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const title = useMemo(() => {
    if (conversation?.isGroup && conversation?.name) return conversation.name;
    const parts = Array.isArray(conversation?.participants)
      ? conversation.participants
      : [];
    const other = parts.find(p => normalizeId(p) !== meId);
    return other?.name || other?.email || 'Chat';
  }, [conversation, meId]);

  const avatarInitial = title?.charAt(0)?.toUpperCase() || '?';

  // ─── Load messages ────────────────────────────────────────────────────────
  const loadInitial = async () => {
    try {
      setLoading(true);
      const res = await fetchMessages({ conversationId, limit: 50 });
      setMessages(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: false }), 50);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [conversationId]);

  // ─── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const s = await getSocket();
        if (!mounted) return;
        socketRef.current = s;

        s.emit('conversation:join', { conversationId }, ack => {
          if (!ack?.ok) {
            Alert.alert('Socket', ack?.error || 'Failed to join conversation');
          }
        });

        const onNew = msg => {
          if (
            msg?.conversationId?.toString?.() !== conversationId?.toString?.()
          )
            return;
          setMessages(prev => {
            if (prev.some(m => m?._id === msg?._id)) return prev;
            return [...prev, msg];
          });
          setTimeout(
            () => listRef.current?.scrollToEnd?.({ animated: true }),
            50,
          );
        };

        s.on('message:new', onNew);
        return () => {
          s.off('message:new', onNew);
        };
      } catch (e) {
        Alert.alert('Socket error', e?.message || 'Failed to connect');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // ─── Send ─────────────────────────────────────────────────────────────────
  const send = async () => {
    const value = text.trim();
    if (!value) return;

    try {
      const s = socketRef.current;
      if (!s) {
        Alert.alert('Socket', 'Not connected');
        return;
      }
      setText('');
      s.emit('message:send', { conversationId, text: value }, ack => {
        if (!ack?.ok) Alert.alert('Error', ack?.error || 'Failed to send');
      });
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to send');
    }
  };

  // ─── Render message bubble ────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const mine =
      (item?.senderId?.id || item?.senderId?._id || item?.senderId) ===
      user?.id;

    return (
      <View
        style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}
      >
        <Text
          style={[styles.msgText, mine ? styles.textMine : styles.textOther]}
        >
          {item?.text}
        </Text>
        <Text style={[styles.time, mine ? styles.timeMine : styles.timeOther]}>
          {item?.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </View>
    );
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#075e54" />
        <CustomHeader
          title={title}
          avatarInitial={avatarInitial}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#075e54" />
        </View>
      </View>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#075e54" />

      {/* ✅ Custom Header with Back Button */}
      <CustomHeader
        title={title}
        avatarInitial={avatarInitial}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd?.({ animated: false })
          }
        />

        {/* ✅ Composer / Input Bar */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Custom Header Component ──────────────────────────────────────────────────
const CustomHeader = ({ title, avatarInitial, onBack }) => (
  <View style={styles.header}>
    {/* Back Button */}
    <TouchableOpacity
      onPress={onBack}
      style={styles.backBtn}
      activeOpacity={0.7}
    >
      <Text style={styles.backArrow}>‹</Text>
    </TouchableOpacity>

    {/* Avatar */}
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{avatarInitial}</Text>
    </View>

    {/* Title + Online status */}
    <View style={styles.headerInfo}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.headerStatus}>online</Text>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#075e54',
    marginTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#ece5dd',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ece5dd',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075e54',
    paddingHorizontal: 8,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 2,
  },
  backArrow: {
    fontSize: 36,
    color: '#fff',
    lineHeight: 36,
    marginTop: -4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#128c7e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  headerStatus: {
    color: '#b2dfdb',
    fontSize: 12,
    marginTop: 1,
  },

  // ── Messages ──
  list: {
    padding: 12,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMine: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMine: { color: '#111' },
  textOther: { color: '#111' },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMine: { color: '#7a9e7e' },
  timeOther: { color: '#aaa' },

  // ── Composer ──
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: '#111',
    maxHeight: 100,
    elevation: 1,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#075e54',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#aaa',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 2,
  },
});

export default ChatScreen;
