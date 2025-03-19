export interface ElementData {
    Entity: string;
    Name?: string;
    modelID?: string;
    expressID?: number;
    relations?: string;
}

export interface Property {
    expressID: number;
    type: number;
    GlobalId?: { value: string; type: number; name: string };
    OwnerHistory?: { value: number; type: number };
    Name?: { value: string; type: number; name: string };
    Description?: string | null;
    ObjectType?: { value: string; type: number; name: string };
    ObjectPlacement?: { value: number; type: number };
    Representation?: { value: number; type: number };
    Tag?: { value: string; type: number; name: string };
    OverallHeight?: { value: number; type: number; name: string };
    OverallWidth?: { value: number; type: number; name: string };
}

export interface ElementNode {
    data: ElementData;
    children: ElementNode[];
    properties?: Property;
    quantity?: number;
}

