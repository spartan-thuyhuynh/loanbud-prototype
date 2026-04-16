import React from "react";

interface PlaceholderViewProps {
  icon: React.ElementType;
  title: string;
  badge?: string;
}

export const PlaceholderView = ({ icon: Icon, title, badge }: PlaceholderViewProps) => (
  <div className="flex-1 h-full flex items-center justify-center bg-background">
    <div className="text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        {title}
      </h2>
      {badge && (
        <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm rounded-full mb-2">
          {badge}
        </span>
      )}
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  </div>
);
