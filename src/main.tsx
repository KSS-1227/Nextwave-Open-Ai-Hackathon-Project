import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { runAutoCleanup } from '@/lib/storage-cleanup'

// Run storage cleanup to prevent JSON parsing errors
runAutoCleanup();

createRoot(document.getElementById("root")!).render(<App />);
