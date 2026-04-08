import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { createConversation, fetchUsers } from '../api/chatApi';

const UsersScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchUsers({ page: 1, limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : [];
      const filtered = list.filter(u => u?._id && u?._id !== user?.id);
      setItems(filtered);
    } catch (e) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (error) Alert.alert('Error', error);
  }, [error]);

  const startChat = async otherUser => {
    try {
      const conversation = await createConversation({
        participantIds: [otherUser._id],
        isGroup: false,
      });

      navigation.navigate('Chat', {
        conversation,
      });
    } catch (e) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075e54" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      <FlatList
        data={items}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item?.name || '?').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.name}>{item?.name}</Text>
              <Text style={styles.email}>{item?.email}</Text>
            </View>
            <Text style={styles.action}>Chat</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#075e54',
    marginBottom: 12,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  sep: { height: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#075e54' },
  meta: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  email: { fontSize: 12, color: '#666', marginTop: 2 },
  action: { color: '#075e54', fontWeight: 'bold' },
});

export default UsersScreen;
