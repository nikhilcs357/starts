import { createAsyncThunk, createSlice, isFulfilled } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
    messages: [],
    conversations: []
}

export const fetchMessages = createAsyncThunk('messages/fetchMessages',
    async ({ token, userId }) => {
        const { data } = await api.post('/api/message/get', { to_user_id: userId }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data;
    })

export const fetchConversations = createAsyncThunk('messages/fetchConversations',
    async (token) => {
        const { data } = await api.get('/api/message/conversations', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return data;
    })

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload || [];
        },
        addMessage: (state, action) => {
            state.messages = [...(state.messages || []), action.payload];
        },
        resetMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = action.payload.messages || []
            }
        })
        builder.addCase(fetchConversations.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.conversations = action.payload.conversations || []
            }
        })
    }
})

export const { setMessages, addMessage, resetMessages } = messagesSlice.actions;

export default messagesSlice.reducer