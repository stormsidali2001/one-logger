import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={5}
    />
  );
}