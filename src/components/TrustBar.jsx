import React from 'react';

const TrustBar = () => {
  const items = [
    '45-Day Delivery',
    '10-Year Warranty',
    'No Hidden Costs',
    'Vastu Certified',
  ];

  return (
    <div className="trust-bar">
      <div className="trust-bar__track">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;
