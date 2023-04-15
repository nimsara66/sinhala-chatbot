import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid';
import store from "store2";

const savedChats = JSON.parse(store.session("@chat"));
const getSafeSavedChats = () => {
  if (Array.isArray(savedChats) && savedChats.length > 0) {
    return savedChats;
  }

  return undefined;
};

const initialChatState = getSafeSavedChats() || [
  {
    id: '1',
    role: 'මෙම වෙබ් අඩවිය ගැන',
    content: [
      {
        emitter: "user",
        message: "මෙම වෙබ් අඩවිය කුමක් සඳහාද?"
      },
      {
        emitter: "gpt",
        message: "මෙම වෙබ් අඩවිය @nimsara66 විසින් නිර්මාණය කරන ලද සිංහල භාෂා වෙබ් අඩවි අතුරුමුහුණතෙහි ChatGPT කෘතිම බුද්ධියේ අනුකලනයකි.\n\nඅපගේ කෘත්‍රිම බුද්ධියෙන් ක්‍රියාත්මක වන චැට්බෝටා සමග සිංහලෙන් කතාබස් කිරීමේ පහසුව අත්විඳින්න."
      }
    ]
  },
  {
    id: '2',
    role: 'මාව follow කරන්න 😉',
    content: [
      {
        emitter: "user",
        message: "Follow කරන්න මාව \nLinkedIn [@nimsara66](https://www.linkedin.com/in/nimsara66)\nMedium [nimsara66](https://medium.com/@nimsara66)\nGitHub [nimsara66](https://github.com/nimsara66)"
      },
      {
        emitter: "gpt",
        message: "ස්තුතියි!"
      }
    ]
  }
];

export const useChat = create((set, get) => ({
  chat: initialChatState,
  selectedChat: initialChatState[0],
  setChat: async (payload) => set(({ chat }) => ({ chat: [...chat, payload] })),
  addChat: async (callback) => {
    const hasNewChat = get().chat.find(({ content }) => (content.length === 0));

    if (!hasNewChat) {
      const id = uuidv4();
      get().setChat({
        role: "නව සංවාදයක්",
        id: id,
        content: []
      });
      get().setSelectedChat({ id });
      if (callback) callback(id);
    } else {
      const { id } = hasNewChat;
      get().setSelectedChat({ id });
      if (callback) callback(id);
    }
  },
  editChat: async (id, payload) => set(({ chat }) => {
    const selectedChat = chat.findIndex((query) => (query.id === id));
    if (selectedChat > -1) {
      chat[selectedChat] = { ...chat[selectedChat], ...payload };
      return ({ chat, selectedChat: chat[selectedChat] });
    }
    return ({});

  }),
  addMessage: async (id, action) => set(({ chat }) => {
    const selectedChat = chat.findIndex((query) => (query.id === id));
    const props = chat[selectedChat];

    if (selectedChat > -1) {
      chat[selectedChat] = { ...props, content: [...props['content'], action] }
      return ({ chat, selectedChat: chat[selectedChat] });
    }

    return ({});
  }),
  editLastMessage: async (id, action) => set(({ chat }) => {
    const selectedChat = chat.findIndex((query) => (query.id === id));
    const props = chat[selectedChat];

    if (selectedChat > -1) {
      const lastIndex = props['content'].length - 1
      props['content'][lastIndex] = action
      chat[selectedChat] = { ...props }
      return ({ chat, selectedChat: chat[selectedChat] });
    }

    return ({});
  }),
  initiateThread: async (id, action) => set(({ chat }) => {
    const selectedChat = chat.findIndex((query) => (query.id === id));
    const props = chat[selectedChat];

    if (selectedChat > -1) {
      props['conversationId'] = action.conversationId
      props['parentMessageId'] = action.parentMessageId
      chat[selectedChat] = { ...props }
      return ({ chat, selectedChat: chat[selectedChat] });
    }

    return ({});
  }),
  setSelectedChat: async (payload) => set(({ chat }) => {
    const selectedChat = chat.find(({ id }) => id === payload.id);
    return ({ selectedChat: selectedChat });
  }),
  removeChat: async (payload) => set(({ chat }) => {
    const newChat = chat.filter(({ id }) => id !== payload.id);
    return ({ chat: newChat });
  }),
  clearAll: async () => set({ chat: [], selectedChat: undefined })
}));