import { useState } from 'react';
import { SegmentBuilder, type SavedSegment } from './campaign/SegmentBuilder';
import { useAppData } from '@/app/contexts/AppDataContext';
import { useNavigate } from 'react-router';

export function SegmentsView() {
  const { contacts } = useAppData();
  const navigate = useNavigate();
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);

  return (
    <SegmentBuilder
      contacts={contacts}
      savedSegments={savedSegments}
      onSaveSegment={(segment) => setSavedSegments([...savedSegments, segment])}
      onDeleteSegment={(id) =>
        setSavedSegments(savedSegments.filter((s) => s.id !== id))
      }
      onBack={() => navigate("/email-workflows/user-segments")}
    />
  );
}
