import * as React from 'react';
export interface EnvisionReactBaseProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
}
export declare function createComponent<P extends object>(tagName: string): React.ForwardRefExoticComponent<React.PropsWithoutRef<P & EnvisionReactBaseProps> & React.RefAttributes<HTMLElement>>;
//# sourceMappingURL=createComponent.d.ts.map