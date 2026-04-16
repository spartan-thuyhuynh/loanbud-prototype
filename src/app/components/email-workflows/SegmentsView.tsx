import { useState } from 'react';
import { SegmentBuilder, type SavedSegment } from './campaign/SegmentBuilder';
import type { Contact } from '@/app/types';

interface SegmentsViewProps {
  contacts: Contact[];
}

export function SegmentsView({ contacts }: SegmentsViewProps) {
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);

  return (
    <SegmentBuilder
      contacts={contacts}
      savedSegments={savedSegments}
      onSaveSegment={(segment) => setSavedSegments([...savedSegments, segment])}
      onDeleteSegment={(id) =>
        setSavedSegments(savedSegments.filter((s) => s.id !== id))
      }
    />
  );
}
