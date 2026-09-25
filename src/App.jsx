import { useState } from 'react';
import MobileApp from './layouts/MobileApp.jsx';
import DesktopApp from './layouts/DesktopApp.jsx';
import ExportStage from './export/ExportStage.jsx';
import ExportSheet from './export/ExportSheet.jsx';
import { useExporter } from './export/useExporter.js';
import { useLetter } from './state/useLetter.js';
import { useMediaQuery } from './hooks/hooks.js';

// Phones (and phones turned sideways) get the phone layout; everything else the PC layout.
const PHONE_QUERY = '(max-width: 820px), (pointer: coarse) and (max-height: 540px)';
const VIEW_KEY = 'crsa-view';

function readSavedView() {
  try {
    return localStorage.getItem(VIEW_KEY);
  } catch {
    return null;
  }
}

export default function App() {
  const autoPhone = useMediaQuery(PHONE_QUERY);
  const [savedView, setSavedView] = useState(readSavedView); // 'phone' | 'pc' | null (automatic)
  const isPhone = savedView ? savedView === 'phone' : autoPhone;

  const letter = useLetter();
  const exporter = useExporter(letter.pages, isPhone ? 'sheet' : 'download');

  const switchView = () => {
    const next = isPhone ? 'pc' : 'phone';
    const automatic = autoPhone ? 'phone' : 'pc';
    const value = next === automatic ? null : next;
    try {
      if (value) localStorage.setItem(VIEW_KEY, value);
      else localStorage.removeItem(VIEW_KEY);
    } catch {
      // Not saved - the switch still works for this visit.
    }
    setSavedView(value);
    window.scrollTo(0, 0);
  };

  const Layout = isPhone ? MobileApp : DesktopApp;

  return (
    <>
      <Layout letter={letter} onExport={exporter.start} onSwitchView={switchView} />
      {exporter.job?.status === 'working' && <ExportStage stageRef={exporter.stageRef} pages={exporter.job.pages} />}
      <ExportSheet job={exporter.job} onClose={exporter.close} />
    </>
  );
}
