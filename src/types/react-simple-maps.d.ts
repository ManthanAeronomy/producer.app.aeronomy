declare module 'react-simple-maps' {
    import { ComponentType, ReactNode, CSSProperties, MouseEvent } from 'react';

    export interface ComposableMapProps {
        projection?: string;
        projectionConfig?: {
            scale?: number;
            center?: [number, number];
            rotate?: [number, number, number];
            parallels?: [number, number];
        };
        width?: number;
        height?: number;
        style?: CSSProperties;
        className?: string;
        children?: ReactNode;
    }

    export interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        translateExtent?: [[number, number], [number, number]];
        onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void;
        onMove?: (position: { coordinates: [number, number]; zoom: number }) => void;
        onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
        children?: ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object;
        children: (props: { geographies: Geography[] }) => ReactNode;
    }

    export interface Geography {
        rsmKey: string;
        properties: Record<string, any>;
        geometry: {
            type: string;
            coordinates: number[] | number[][] | number[][][];
        };
    }

    export interface GeographyProps {
        geography: Geography;
        style?: {
            default?: CSSProperties;
            hover?: CSSProperties;
            pressed?: CSSProperties;
        };
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        className?: string;
        onMouseEnter?: (event: MouseEvent) => void;
        onMouseLeave?: (event: MouseEvent) => void;
        onClick?: (event: MouseEvent) => void;
    }

    export interface MarkerProps {
        coordinates: [number, number];
        children?: ReactNode;
        style?: {
            default?: CSSProperties;
            hover?: CSSProperties;
            pressed?: CSSProperties;
        };
        className?: string;
        onMouseEnter?: (event: MouseEvent) => void;
        onMouseLeave?: (event: MouseEvent) => void;
        onClick?: (event: MouseEvent) => void;
    }

    export interface LineProps {
        from: [number, number];
        to: [number, number];
        stroke?: string;
        strokeWidth?: number;
        strokeLinecap?: 'butt' | 'round' | 'square';
        strokeDasharray?: string;
        style?: CSSProperties;
        className?: string;
    }

    export interface GraticuleProps {
        stroke?: string;
        strokeWidth?: number;
        style?: CSSProperties;
        className?: string;
    }

    export interface SphereProps {
        id?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        style?: CSSProperties;
        className?: string;
    }

    export interface AnnotationProps {
        subject: [number, number];
        dx?: number;
        dy?: number;
        curve?: number;
        children?: ReactNode;
        connectorProps?: CSSProperties;
    }

    export const ComposableMap: ComponentType<ComposableMapProps>;
    export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
    export const Geographies: ComponentType<GeographiesProps>;
    export const Geography: ComponentType<GeographyProps>;
    export const Marker: ComponentType<MarkerProps>;
    export const Line: ComponentType<LineProps>;
    export const Graticule: ComponentType<GraticuleProps>;
    export const Sphere: ComponentType<SphereProps>;
    export const Annotation: ComponentType<AnnotationProps>;
}
