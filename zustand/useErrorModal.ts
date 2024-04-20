import { create } from 'zustand';
export interface ErrorModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const useErrorModal = create<ErrorModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
export default useErrorModal;
