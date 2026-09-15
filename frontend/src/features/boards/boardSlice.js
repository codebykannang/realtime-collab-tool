import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchBoards = createAsyncThunk("board/fetchBoards", async () => {
  const { data } = await api.get("/boards");
  return data;
});

export const fetchBoardDetail = createAsyncThunk("board/fetchBoardDetail", async (boardId) => {
  const { data } = await api.get(`/boards/${boardId}`);
  return data;
});

export const createBoard = createAsyncThunk("board/createBoard", async (title) => {
  const { data } = await api.post("/boards", { title });
  return data;
});

const boardSlice = createSlice({
  name: "board",
  initialState: {
    boards: [],
    activeBoard: null,
    lists: [],
    cards: [],
    presence: [], // [{ userId, name, color, socketId }]
    cursors: {}, // userId -> { x, y, name, color }
    chatMessages: [],
    typingUsers: {}, // userId -> name
    status: "idle",
  },
  reducers: {
    // --- realtime reducers, driven by socket events ---
    presenceUpdated(state, action) {
      state.presence = action.payload;
    },
    cursorMoved(state, action) {
      const { userId, x, y, name, color } = action.payload;
      state.cursors[userId] = { x, y, name, color };
    },
    listCreatedRemote(state, action) {
      if (!state.lists.find((l) => l._id === action.payload._id)) {
        state.lists.push(action.payload);
      }
    },
    cardCreatedRemote(state, action) {
      if (!state.cards.find((c) => c._id === action.payload._id)) {
        state.cards.push(action.payload);
      }
    },
    cardMovedRemote(state, action) {
      const { cardId, toListId, toPosition } = action.payload;
      const card = state.cards.find((c) => c._id === cardId);
      if (card) {
        card.list = toListId;
        card.position = toPosition;
      }
    },
    cardUpdatedRemote(state, action) {
      const { cardId, changes } = action.payload;
      const card = state.cards.find((c) => c._id === cardId);
      if (card) Object.assign(card, changes);
    },
    cardLockedRemote(state, action) {
      const card = state.cards.find((c) => c._id === action.payload.cardId);
      if (card) card.lockedBy = action.payload.userId;
    },
    cardUnlockedRemote(state, action) {
      const card = state.cards.find((c) => c._id === action.payload.cardId);
      if (card) card.lockedBy = null;
    },
    // Optimistic local move, applied instantly before the server confirms
    cardMovedLocal(state, action) {
      const { cardId, toListId, toPosition } = action.payload;
      const card = state.cards.find((c) => c._id === cardId);
      if (card) {
        card.list = toListId;
        card.position = toPosition;
      }
    },
    chatMessageReceived(state, action) {
      state.chatMessages.push(action.payload);
    },
    typingReceived(state, action) {
      state.typingUsers[action.payload.userId] = action.payload.name;
    },
    typingCleared(state, action) {
      delete state.typingUsers[action.payload.userId];
    },
    clearActiveBoard(state) {
      state.activeBoard = null;
      state.lists = [];
      state.cards = [];
      state.presence = [];
      state.cursors = {};
      state.chatMessages = [];
      state.typingUsers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.boards = action.payload;
      })
      .addCase(fetchBoardDetail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeBoard = action.payload.board;
        state.lists = action.payload.lists;
        state.cards = action.payload.cards;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload);
      });
  },
});

export const {
  presenceUpdated,
  cursorMoved,
  listCreatedRemote,
  cardCreatedRemote,
  cardMovedRemote,
  cardUpdatedRemote,
  cardLockedRemote,
  cardUnlockedRemote,
  cardMovedLocal,
  chatMessageReceived,
  typingReceived,
  typingCleared,
  clearActiveBoard,
} = boardSlice.actions;

export default boardSlice.reducer;
