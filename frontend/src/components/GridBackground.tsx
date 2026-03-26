import React from 'react';

export const GridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]"></div>
  );
};
