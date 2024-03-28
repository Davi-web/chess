import { create } from 'zustand';
export interface CustomDialogModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const useCustomDialogModal = create<CustomDialogModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
export default useCustomDialogModal;
