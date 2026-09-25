import { useCallback, useEffect, useRef, useState } from 'react';
import { createLetterFiles, downloadFiles } from '../letter/exportLetter.js';

let jobCounter = 0;

// Creates the PDF / image files.
//   mode 'download' (PC): files are saved straight away.
//   mode 'sheet' (phone): a sheet opens with a Share / Save button. iPhones only
//   allow the share menu to open from a fresh tap, so it can't open by itself
//   after the file has been made.
export function useExporter(letter, layout, mode) {
  const [job, setJob] = useState(null);
  const stageRef = useRef(null);
  const current = useRef({ letter, layout, mode, job });
  current.current = { letter, layout, mode, job };

  const start = useCallback((kind) => {
    const { letter: l, layout: lay, job: j } = current.current;
    if (j?.status === 'working') return;
    jobCounter += 1;
    setJob({ id: jobCounter, kind, status: 'working', letter: l, layout: lay });
  }, []);

  const close = useCallback(() => {
    current.current.job?.urls?.forEach((url) => URL.revokeObjectURL(url));
    setJob(null);
  }, []);

  useEffect(() => {
    if (job?.status !== 'working') return undefined;
    let cancelled = false;

    createLetterFiles(stageRef.current, job.kind, job.letter)
      .then(async (files) => {
        if (cancelled) return;
        if (current.current.mode === 'download') {
          await downloadFiles(files);
          if (!cancelled) setJob(null);
          return;
        }
        setJob({ ...job, status: 'ready', files, urls: files.map((file) => URL.createObjectURL(file)) });
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setJob({ ...job, status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [job]);

  return { job, start, close, stageRef };
}
