// src/components/Chat.vue
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title> Chat App </q-toolbar-title>
        <q-btn flat round dense icon="person" @click="rightDrawerOpen = !rightDrawerOpen" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">
          Chats
          <q-btn
            flat
            round
            dense
            icon="add"
            class="float-right"
            @click="showNewChatDialog = true"
          />
        </q-item-label>
        <q-separator />

        <q-item
          v-for="room in chatRooms"
          :key="room.id"
          clickable
          v-ripple
          :active="currentRoom && currentRoom.id === room.id"
          @click="selectRoom(room)"
        >
          <q-item-section avatar>
            <q-avatar>
              <q-icon v-if="room.is_group" name="group" color="primary" size="sm" />
              <q-icon v-else name="person" color="teal" size="sm" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ room.name }}</q-item-label>
            <q-item-label caption lines="1">
              {{
                room.last_message
                  ? `${room.last_message.sender.username}: ${room.last_message.content}`
                  : 'No messages yet'
              }}
            </q-item-label>
          </q-item-section>

          <q-item-section side v-if="room.unread_count > 0">
            <q-badge color="red" text-color="white">{{ room.unread_count }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" bordered content-class="bg-grey-1">
      <q-list v-if="currentRoom">
        <q-item-label header class="text-grey-8">
          {{ currentRoom.is_group ? 'Group Members' : 'Chat Info' }}
        </q-item-label>
        <q-separator />

        <q-item v-for="user in currentRoom.participants" :key="user.id">
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="person" color="teal" size="sm" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ user.username }}</q-item-label>
            <q-item-label caption>{{ user.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="chat-container">
        <div v-if="!currentRoom" class="no-room-selected">
          <q-icon name="chat" size="6rem" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">Select a chat or create a new one</div>
        </div>

        <template v-else>
          <div class="chat-header">
            <h4 class="q-ma-none">{{ currentRoom.name }}</h4>
          </div>

          <div class="chat-messages" ref="messagesContainer">
            <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
              <div :class="['message', message.sender.id === currentUser.id ? 'sent' : 'received']">
                <div class="message-sender" v-if="shouldShowSender(message, index)">
                  {{ message.sender.username }}
                </div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                  <q-icon
                    name="done_all"
                    size="xs"
                    :color="isMessageReadByAll(message) ? 'blue' : 'grey'"
                    v-if="message.sender.id === currentUser.id"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <q-input
              v-model="newMessage"
              placeholder="Type a message"
              outlined
              dense
              bg-color="white"
              @keyup.enter="sendMessage"
            >
              <template v-slot:after>
                <q-btn round dense flat icon="send" color="primary" @click="sendMessage" />
              </template>
            </q-input>
          </div>
        </template>
      </div>
    </q-page-container>

    <!-- Dialog for creating a new chat -->
    <q-dialog v-model="showNewChatDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New Chat</div>
        </q-card-section>

        <q-card-section>
          <q-tabs
            v-model="newChatTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="direct" label="Direct Message" />
            <q-tab name="group" label="Group Chat" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="newChatTab" animated>
            <q-tab-panel name="direct">
              <q-select
                v-model="selectedUser"
                :options="users.filter((u) => u.id !== currentUser.id)"
                option-label="username"
                label="Select User"
                outlined
                dense
              />
            </q-tab-panel>

            <q-tab-panel name="group">
              <q-input v-model="groupName" label="Group Name" outlined dense class="q-mb-md" />
              <q-select
                v-model="selectedUsers"
                :options="users.filter((u) => u.id !== currentUser.id)"
                option-label="username"
                multiple
                label="Select Users"
                outlined
                dense
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Create" color="primary" @click="createChat" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'ChatComponent',

  data() {
    return {
      leftDrawerOpen: true,
      rightDrawerOpen: false,
      chatRooms: [],
      currentRoom: null,
      messages: [],
      newMessage: '',
      currentUser: {},
      users: [],
      socket: null,
      showNewChatDialog: false,
      newChatTab: 'direct',
      selectedUser: null,
      selectedUsers: [],
      groupName: '',
    }
  },

  created() {
    this.getCurrentUser()
    this.fetchUsers()
    this.fetchChatRooms()
  },

  methods: {
    getCurrentUser() {
      this.$api
        .get('/api/chats/rooms/users/')
        .then((response) => {
          this.currentUser = response.data
        })
        .catch((error) => {
          console.error('Error fetching current user:', error)
        })
    },

    fetchUsers() {
      this.$api
        .get('/api/chats/rooms/users/')
        .then((response) => {
          this.users = response.data
        })
        .catch((error) => {
          console.error('Error fetching users:', error)
        })
    },

    fetchChatRooms() {
      this.$api
        .get('/api/chats/rooms/chatrooms/')
        .then((response) => {
          this.chatRooms = response.data
        })
        .catch((error) => {
          console.error('Error fetching chat rooms:', error)
        })
    },

    selectRoom(room) {
      this.currentRoom = room
      this.fetchMessages(room.id)
      this.connectWebSocket(room.id)
    },

    fetchMessages(roomId) {
      this.$api
        .get(`/api/chats/rooms/messages/?room_id=${roomId}`)
        .then((response) => {
          this.messages = response.data
          this.markMessagesAsRead()
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        })
        .catch((error) => {
          console.error('Error fetching messages:', error)
        })
    },

    sendMessage() {
      if (!this.newMessage.trim()) return

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: 'message',
            content: this.newMessage.trim(),
          }),
        )

        this.newMessage = ''
      } else {
        console.error('WebSocket is not connected')
      }
    },

    connectWebSocket(roomId) {
      // Close existing connection if any
      if (this.socket) {
        this.socket.close()
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${import.meta.env.VITE_CHAT_BASE_URL}/ws/chat/${roomId}/`
      console.log(`${wsUrl}`)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('WebSocket connected')
      }

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'message') {
          this.messages.push(data.message)
          this.$nextTick(() => {
            this.scrollToBottom()
          })

          // Mark message as read if it's not from the current user
          if (data.message.sender.id !== this.currentUser.id) {
            this.markMessageAsRead(data.message.id)
          }

          // Update last message in chat rooms list
          this.updateChatRoomLastMessage(this.currentRoom.id, data.message)
        } else if (data.type === 'read') {
          // Update read status for the message
          const messageIndex = this.messages.findIndex((m) => m.id === data.message_id)
          if (messageIndex !== -1) {
            const message = this.messages[messageIndex]
            if (!message.read_by.some((user) => user.id === data.user_id)) {
              message.read_by.push({ id: data.user_id })
            }
          }
        }
      }

      this.socket.onclose = () => {
        console.log('WebSocket disconnected')
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    },

    markMessagesAsRead() {
      if (!this.currentRoom) return

      this.messages.forEach((message) => {
        if (
          message.sender.id !== this.currentUser.id &&
          !message.read_by.some((user) => user.id === this.currentUser.id)
        ) {
          this.markMessageAsRead(message.id)
        }
      })
    },

    markMessageAsRead(messageId) {
      this.$api.post(`/api/chats/rooms/messages/${messageId}/mark_as_read/`).catch((error) => {
        console.error('Error marking message as read:', error)
      })

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: 'read',
            message_id: messageId,
          }),
        )
      }
    },

    updateChatRoomLastMessage(roomId, message) {
      const roomIndex = this.chatRooms.findIndex((room) => room.id === roomId)
      if (roomIndex !== -1) {
        this.chatRooms[roomIndex].last_message = message

        // Update unread count if necessary
        if (
          message.sender.id !== this.currentUser.id &&
          !message.read_by.some((user) => user.id === this.currentUser.id)
        ) {
          this.chatRooms[roomIndex].unread_count += 1
        }
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    formatTime(timestamp) {
      return format(new Date(timestamp), 'HH:mm')
    },

    shouldShowSender(message, index) {
      // Show sender name if it's the first message or if the previous message was from a different sender
      if (index === 0) return true
      return message.sender.id !== this.messages[index - 1].sender.id
    },

    isMessageReadByAll(message) {
      if (!this.currentRoom) return false

      // For direct chats, check if the other person has read the message
      if (!this.currentRoom.is_group) {
        const otherUser = this.currentRoom.participants.find(
          (user) => user.id !== this.currentUser.id,
        )
        return message.read_by.some((user) => user.id === otherUser.id)
      }

      // For group chats, check if all participants have read the message
      return this.currentRoom.participants.every((participant) =>
        message.read_by.some((user) => user.id === participant.id),
      )
    },

    createChat() {
      if (this.newChatTab === 'direct') {
        if (!this.selectedUser) {
          this.$q.notify({
            color: 'negative',
            message: 'Please select a user',
            position: 'top',
          })
          return
        }

        this.$api
          .post('/api/chats/rooms/chatrooms/create_or_get_direct_chat/', {
            user_id: this.selectedUser.id,
          })
          .then((response) => {
            const room = response.data
            // Check if room already exists in list
            const existingRoomIndex = this.chatRooms.findIndex((r) => r.id === room.id)
            if (existingRoomIndex === -1) {
              this.chatRooms.unshift(room)
            }
            this.selectRoom(room)
            this.resetNewChatForm()
          })
          .catch((error) => {
            console.error('Error creating direct chat:', error)
          })
      } else {
        if (!this.groupName.trim()) {
          this.$q.notify({
            color: 'negative',
            message: 'Please enter a group name',
            position: 'top',
          })
          return
        }

        if (this.selectedUsers.length === 0) {
          this.$q.notify({
            color: 'negative',
            message: 'Please select at least one user',
            position: 'top',
          })
          return
        }

        this.$api
          .post('/api/chats/rooms/chatrooms/create_group_chat/', {
            name: this.groupName.trim(),
            participants: this.selectedUsers.map((user) => user.id),
          })
          .then((response) => {
            const room = response.data
            this.chatRooms.unshift(room)
            this.selectRoom(room)
            this.resetNewChatForm()
          })
          .catch((error) => {
            console.error('Error creating group chat:', error)
          })
      }
    },

    resetNewChatForm() {
      this.showNewChatDialog = false
      this.newChatTab = 'direct'
      this.selectedUser = null
      this.selectedUsers = []
      this.groupName = ''
    },
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.close()
    }
  },
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.no-room-selected {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #9e9e9e;
}

.chat-header {
  padding: 16px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message-wrapper {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.sent {
  align-self: flex-end;
  background-color: #dcf8c6;
  margin-left: auto;
}

.message.received {
  align-self: flex-start;
  background-color: white;
  margin-right: auto;
}

.message-sender {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 2px;
  color: #555;
}

.message-content {
  word-break: break-word;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.message-time .q-icon {
  margin-left: 4px;
}

.chat-input {
  padding: 12px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
}

/* Media Queries for Responsiveness */
@media (max-width: 600px) {
  .message {
    max-width: 85%;
  }

  .chat-header h4 {
    font-size: 1.1rem;
  }

  .chat-input {
    padding: 8px;
  }
}
</style>
