import { useState } from 'react';
import { SegmentBuilder, type SavedSegment } from './campaign/SegmentBuilder';
import { useAppData } from '@/app/contexts/AppDataContext';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';

export function SegmentsView() {
  const { contacts, segments, handleCreateSegment, handleUpdateSegment } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const segmentId = (location.state as { segmentId?: string } | null)?.segmentId;

  const editingSegment = segmentId ? segments.find((s) => s.id === segmentId) : undefined;

  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);

  const handleSave = (segment: SavedSegment) => {
    if (editingSegment) {
      handleUpdateSegment(editingSegment.id, { name: segment.name });
      toast.success('Segment updated.');
      navigate('/email-workflows/user-segments');
    } else {
      handleCreateSegment({
        name: segment.name,
        contactCount: 0,
        status: 'Active',
        createdBy: 'You',
        filters: segment.filters,
      });
      setSavedSegments((prev) => [...prev, segment]);
      toast.success('Segment created.');
      navigate('/email-workflows/user-segments');
    }
  };

  return (
    <SegmentBuilder
      contacts={contacts}
      savedSegments={savedSegments}
      onSaveSegment={handleSave}
      onDeleteSegment={(id) =>
        setSavedSegments(savedSegments.filter((s) => s.id !== id))
      }
      onBack={() => navigate('/email-workflows/user-segments')}
      initialName={editingSegment?.name}
      initialDescription={editingSegment ? '' : undefined}
    />
  );
}
