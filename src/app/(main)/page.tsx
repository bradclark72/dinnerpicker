import { FirebaseClientProvider } from '@/firebase';
import PageContent from './page-content';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <PageContent />
    </FirebaseClientProvider>
  );
}
