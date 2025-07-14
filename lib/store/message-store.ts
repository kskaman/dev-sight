import { create } from "zustand";

type State = {
  tempAssistantMessage: string;
  setTempMessage: (text: string) => void;
  resetTemp: () => void;
};

export const useMessageStore = create<State>((set) => ({
  tempAssistantMessage: "",
  setTempMessage: (text) => set({ tempAssistantMessage: text }),
  resetTemp: () => set({ tempAssistantMessage: "" }),
}));
