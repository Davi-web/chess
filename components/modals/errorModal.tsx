'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { TimerModalStore } from '@/zustand/useTimerModal';

interface TimerModalProps {
  modal: TimerModalStore;
  title: string;
  contentText: string;
  handleClose: () => void;
  handleContinue: () => void;
  children: React.ReactNode;
}

const TimerModal: React.FC<TimerModalProps> = ({
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
        <div className="flex justify-center space-x-4">
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default TimerModal;
