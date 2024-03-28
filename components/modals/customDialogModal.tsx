'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomDialogModalStore } from '@/zustand/useCustomDialogModal';

interface CustomDialogModalProps {
  modal: CustomDialogModalStore;
  title: string;
  contentText: string;
  handleClose: () => void;
  handleContinue: () => void;
  children: React.ReactNode;
}

const CustomDialogModal: React.FC<CustomDialogModalProps> = ({
  modal,
  title,
  contentText,
  handleClose,
  handleContinue,
  children,
}) => {
  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      {/*dialog container*/}
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {/* Main body of modal/dialog */}
        <DialogDescription>
          {/* main text */}
          {contentText}
        </DialogDescription>
        {children} {/* Other content */}
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleContinue}>Continue</Button>
      </DialogContent>
    </Dialog>
  );
};
export default CustomDialogModal;
