import React from 'react';
import { useSpring, animated } from 'react-spring';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 2000 }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { duration },
  });

  return (
    <animated.span>
      {number.to((n) => Math.floor(n))}
    </animated.span>
  );
};

export default AnimatedNumber;
