import { Button } from "../../ui/button";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCampaignModal({ isOpen, onClose }: NewCampaignModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh]">
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          Create New Campaign
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Campaign Name
            </label>
            <input
              type="text"
              placeholder="e.g., Spring Promotion"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Select Segment
            </label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose a segment...</option>
              <option value="seg1">New Broker Listings</option>
              <option value="seg2">Dormant Contacts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Select Template
            </label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose a template...</option>
              <option value="tpl1">Claim Your Listing</option>
              <option value="tpl2">Day 3 Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Send Options
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="sendOption" defaultChecked />
                <span>Send Now</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sendOption" />
                <span>Schedule for Later</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-3 text-muted-foreground">
              Add Follow-up Tasks (Optional)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked />
                <span>Day 0: Initial follow-up call</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked />
                <span>Day 3: Check-in call</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" />
                <span>Day 7: Week follow-up</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 w-full">
          <Button
            size="lg"
            className="flex-grow"
            onClick={() => {
              // Handle campaign creation logic here
              onClose();
            }}
          >
            Create & Send
          </Button>
          <Button size="lg" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
