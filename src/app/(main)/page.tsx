import { FirebaseClientProvider } from '@/firebase/client-provider';
import PageContent from './page-content';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <PageContent />
    </FirebaseClientProvider>
  );
}
