import React from 'react';

const TrustBar = () => {
  const items = [
    '45-Day Delivery',
    '5-Year Warranty',
    'No Hidden Costs',
    '99% Vastu Compliant',
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
