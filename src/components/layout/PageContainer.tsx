import { ReactNode } from 'react';
import classes from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`${classes.pageContainer} ${className}`}>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
}
