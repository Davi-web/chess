import { create } from 'zustand';
export interface TimerModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const useTimerModal = create<TimerModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
export default useTimerModal;
