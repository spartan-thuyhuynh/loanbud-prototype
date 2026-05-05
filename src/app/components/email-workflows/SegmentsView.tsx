import { useState } from 'react';
import { SegmentBuilder, type SavedSegment } from './SegmentBuilder';
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

  const editingAsSaved: SavedSegment | undefined = editingSegment
    ? {
        id: editingSegment.id,
        name: editingSegment.name,
        description: '',
        filters: editingSegment.filters,
        createdAt: editingSegment.createdAt,
        excludeFilters: editingSegment.excludeFilters,
        includedContactIds: editingSegment.includedContactIds,
        excludedContactIds: editingSegment.excludedContactIds,
      }
    : undefined;

  const handleSave = (segment: SavedSegment) => {
    if (editingSegment) {
      handleUpdateSegment(editingSegment.id, {
        name: segment.name,
        filters: segment.filters,
        excludeFilters: segment.excludeFilters,
        includedContactIds: segment.includedContactIds,
        excludedContactIds: segment.excludedContactIds,
      });
      toast.success('Segment updated.');
    } else {
      handleCreateSegment({
        name: segment.name,
        contactCount: 0,
        status: 'Active',
        createdBy: 'You',
        filters: segment.filters,
        excludeFilters: segment.excludeFilters,
        includedContactIds: segment.includedContactIds,
        excludedContactIds: segment.excludedContactIds,
      });
      setSavedSegments((prev) => [...prev, segment]);
      toast.success('Segment created.');
    }
    navigate('/email-workflows/user-segments');
  };

  return (
    <SegmentBuilder
      contacts={contacts}
      savedSegments={savedSegments}
      onSaveSegment={handleSave}
      onDeleteSegment={(id) =>
        setSavedSegments(savedSegments.filter((s) => s.id !== id))
      }
      onBack={() => navigate(-1)}
      initialName={editingSegment?.name}
      initialDescription={editingSegment ? '' : undefined}
      initialSegment={editingAsSaved}
    />
  );
}
