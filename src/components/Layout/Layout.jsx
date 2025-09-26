import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children, className = '', spacing = 'default' }) => {
  const spacingClasses = {
    tight: 'space-y-4',
    default: 'space-y-6',
    relaxed: 'space-y-8',
    loose: 'space-y-12'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 layout-dark ${className}`}>
      <div className={`container-system container-xl ${spacingClasses[spacing]}`}>
        {children}
      </div>
    </div>
  );
};

export const Section = ({ 
  children, 
  className = '', 
  spacing = 'default',
  background = 'transparent',
  animate = true 
}) => {
  const spacingClasses = {
    tight: 'py-12',
    default: 'py-20',
    relaxed: 'py-24',
    loose: 'py-32'
  };

  const backgroundClasses = {
    transparent: '',
    subtle: 'bg-gradient-to-b from-transparent via-neutral-900/30 to-transparent',
    accent: 'bg-gradient-to-r from-primary-900/10 via-primary-800/5 to-primary-900/10'
  };

  const content = (
    <section className={`section ${spacingClasses[spacing]} ${backgroundClasses[background]} ${className}`}>
      <div className="container-system container-xl">
        {children}
      </div>
    </section>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {content}
    </motion.div>
  );
};

export const Grid = ({ 
  children, 
  cols = 3, 
  gap = 'md', 
  className = '',
  responsive = true 
}) => {
  const gapClasses = {
    sm: 'gap-sm',
    md: 'gap-md', 
    lg: 'gap-lg',
    xl: 'gap-xl'
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6'
  };

  return (
    <div className={`grid-system ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export const Card = ({ 
  children, 
  variant = 'default',
  padding = 'lg',
  hover = true,
  className = '' 
}) => {
  const variantClasses = {
    default: 'card-enhanced',
    premium: 'card-enhanced bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-primary-900/20 border-primary-500/30',
    accent: 'card-enhanced bg-gradient-to-br from-accent-cyan/10 via-accent-purple/5 to-accent-pink/10'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <motion.div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const Flex = ({ 
  children, 
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '' 
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={`
      flex-system 
      ${directionClasses[direction]} 
      ${alignClasses[align]} 
      ${justifyClasses[justify]} 
      ${gapClasses[gap]}
      ${wrap ? 'flex-wrap' : 'flex-nowrap'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Layout;
