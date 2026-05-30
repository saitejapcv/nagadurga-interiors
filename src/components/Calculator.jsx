import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';

const STEPS = [
  { id: 'bhk', title: 'Select BHK Type', subtitle: 'How many rooms are we designing?' },
  { id: 'area', title: 'Select Your Area', subtitle: 'Location in Hyderabad affects material and labor costs.' },
  { id: 'style', title: 'Preferred Style', subtitle: 'What defines your aesthetic?' },
  { id: 'result', title: 'Your Estimate', subtitle: 'A personalized calculation for your home.' },
];

const OPTIONS = {
  bhk: [
    { id: '1bhk', label: '1 BHK', icon: '🏠', base: 350000 },
    { id: '2bhk', label: '2 BHK', icon: '🏠🏠', base: 550000 },
    { id: '3bhk', label: '3 BHK', icon: '🏢', base: 850000 },
    { id: 'villa', label: 'Villa', icon: '🏰', base: 1500000 },
  ],
  area: [
    { id: 'jubilee-hills', label: 'Jubilee Hills', multiplier: 1.20 },
    { id: 'banjara-hills', label: 'Banjara Hills', multiplier: 1.18 },
    { id: 'gachibowli', label: 'Gachibowli', multiplier: 1.10 },
    { id: 'kondapur', label: 'Kondapur', multiplier: 1.05 },
    { id: 'kukatpally', label: 'Kukatpally', multiplier: 1.00 },
    { id: 'manikonda', label: 'Manikonda', multiplier: 0.95 },
  ],
  style: [
    { id: 'modern', label: 'Modern', multiplier: 1.0 },
    { id: 'traditional', label: 'Traditional', multiplier: 1.15 },
    { id: 'minimalist', label: 'Minimalist', multiplier: 0.9 },
    { id: 'luxury', label: 'Luxury', multiplier: 1.4 },
  ],
};

const AnimatedPrice = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('₹0');

  useEffect(() => {
    if (!isInView || value === 0) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay('₹' + Math.floor(latest).toLocaleString('en-IN'));
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return <span ref={ref}>{display}</span>;
};

const Calculator = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({ bhk: null, area: null, style: null });

  const handleSelect = (key, val) => {
    setSelections((prev) => ({ ...prev, [key]: val }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const calculateEstimate = () => {
    const bhk = OPTIONS.bhk.find((o) => o.id === selections.bhk);
    const area = OPTIONS.area.find((o) => o.id === selections.area);
    const style = OPTIONS.style.find((o) => o.id === selections.style);
    if (!bhk || !area || !style) return 0;
    const total = bhk.base * area.multiplier * style.multiplier;
    return Math.round(total / 1000) * 1000;
  };

  const formatCurrency = (n) => '₹' + n.toLocaleString('en-IN');
  const currentStepData = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const currentKey = currentStepData.id;

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="mono" style={{ marginBottom: '0.5rem' }}>Estimate Tool V1.0</div>
      </div>

      <div className="calculator-container">
        <div className="step-indicator">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className={`step-dot ${i <= step ? 'active' : ''}`}
              animate={{ scaleX: i <= step ? 1 : 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!isLastStep ? (
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <h2>{currentStepData.title}</h2>
              <p className="subtitle">{currentStepData.subtitle}</p>

              <motion.div
                className="option-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } }
                }}
              >
                {OPTIONS[currentKey].map((opt) => (
                  <motion.div
                    key={opt.id}
                    className={`option-card ${selections[currentKey] === opt.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(currentKey, opt.id)}
                    variants={{
                      hidden: { scale: 0.9, opacity: 0 },
                      visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 12 } }
                    }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                    animate={selections[currentKey] === opt.id ? {
                      scale: [1, 1.02, 1],
                      transition: { duration: 0.3 }
                    } : {}}
                  >
                    {opt.icon && <span className="icon">{opt.icon}</span>}
                    <span className="label">{opt.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="calc-actions">
                <motion.button
                  className="btn"
                  onClick={back}
                  disabled={step === 0}
                  whileHover={{ scale: step === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: step === 0 ? 1 : 0.95 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="btn btn-primary"
                  onClick={next}
                  disabled={!selections[currentKey]}
                  whileHover={{ scale: !selections[currentKey] ? 1 : 1.05 }}
                  whileTap={{ scale: !selections[currentKey] ? 1 : 0.95 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="result-card"
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <div className="mono" style={{ marginBottom: '1rem', opacity: 0.6 }}>
                Your Personalized Estimate
              </div>
              <h2>
                {selections.bhk?.toUpperCase()} in{' '}
                {OPTIONS.area.find((a) => a.id === selections.area)?.label || 'Hyderabad'}
              </h2>
              <div className="result-price">
                <AnimatedPrice value={calculateEstimate()} />*
              </div>
              <p className="result-disclaimer">
                *This is a ballpark figure based on standard materials.
                <br />
                Actual costs may vary by +/- 15% depending on specific finishes.
              </p>
              <motion.a
                href="https://wa.me/918523013312?text=Hi,%20I%20just%20got%20an%20estimate%20of%20"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Free Consultation
              </motion.a>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Calculator;
