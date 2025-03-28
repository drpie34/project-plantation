import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type CardContainerProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
};

/**
 * A consistent card container component used throughout the application
 */
export const CardContainer = ({
  title,
  description,
  children,
  footer,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = ''
}: CardContainerProps) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={`${contentClassName}`}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={`${footerClassName}`}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};