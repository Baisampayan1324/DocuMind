import React from 'react';

export const Stats: React.FC = () => {
  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl font-bold">Key Statistics</h2>
      <div className="flex justify-center gap-10 mt-10">
        <div><div className="text-4xl font-bold">10k+</div><div>Documents</div></div>
        <div><div className="text-4xl font-bold">500+</div><div>Users</div></div>
      </div>
    </section>
  );
};
