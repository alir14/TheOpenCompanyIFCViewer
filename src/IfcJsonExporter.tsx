// File: App.tsx
import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import { computeRowData, getRowFragmentIdMap } from "./component/relationTree/TreeManager";
import { IfcProperties } from "@thatopen/fragments";
import { ElementData, ElementNode, Property } from "./ifcModel";

const selectHighlighterName: string = "select";
const inverseAttributes: OBC.InverseAttribute[] = ["IsDecomposedBy", "ContainsElements"];

interface RelationTreeProps {
    expressID?: number;
}

const IfcJsonExporter: React.FC<RelationTreeProps> = ({
    expressID,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [model, setModel] = useState<FRAGS.FragmentsGroup>();
    const [treeData, setTreeData] = useState<BUI.TableGroupData[]>([]); // State to store table data
    const [highlighter, setHighlighter] = useState<OBF.Highlighter>();

    const components = new OBC.Components();

    const extendElementsWithProperties = (
        elements: BUI.TableGroupData<any>[],
        ifcProperties: IfcProperties
    ): ElementNode[] => {
        return elements.map((element) => {
            // We assume that element.data contains an expressID.
            const expressID = element.data.expressID as number;
            const matchedProperty: Property = ifcProperties[expressID] as Property || {} as Property;

            // Recursively process children if they exist.
            const extendedChildren = element.children
                ? extendElementsWithProperties(element.children, ifcProperties)
                : undefined;

            return {
                data: element.data as ElementData,
                children: extendedChildren,
                properties: matchedProperty,
            };
        });
    };

    const generateUniqueExpressID = (usedId: Set<number>) => {
        let id = 1;
        while (usedId.has(id)) {
            id++;
        }
        return id;
    }

    const assignUniqueExpressIds = (elements: ElementNode[], usedIds: Set<number>) => {
        elements.forEach((element) => {
            const currentId = element.data.expressID;

            if (currentId !== undefined && currentId !== null && !usedIds.has(currentId)) {
                usedIds.add(currentId);
            } else {
                const newId = generateUniqueExpressID(usedIds);
                element.data.expressID = newId;
                usedIds.add(newId);
            }

            if (element.children && element.children.length > 0) {
                assignUniqueExpressIds(element.children, usedIds);
            }
        });
    }

    useEffect(() => {
        let isLoaingInprogress = true;

        if (!containerRef.current) {
            return;
        }
        const container = containerRef.current;

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        const sceneComponent = new OBC.SimpleScene(components);
        sceneComponent.setup();
        world.scene = sceneComponent;

        const rendererComponent = new OBC.SimpleRenderer(components, container);
        world.renderer = rendererComponent;

        const cameraComponent = new OBC.SimpleCamera(components);
        world.camera = cameraComponent;

        container.addEventListener("resize", () => {
            rendererComponent.resize();
            cameraComponent.updateAspect();
        });

        const grids = components.get(OBC.Grids);
        grids.create(world);

        components.init();

        const ifcLoader = components.get(OBC.IfcLoader);

        const highlighter = components.get(OBF.Highlighter);
        highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        setHighlighter(highlighter);

        const fragmentsManager = components.get(OBC.FragmentsManager);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            if (world.scene) {
                world.scene.three.add(model);
            }
        });

        const indexer = components.get(OBC.IfcRelationsIndexer);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            console.log("what ????")
            if (model.hasProperties) await indexer.process(model);
        });

        const fetchAndLoad = async () => {

            const exporter = components.get(OBC.IfcJsonExporter);

            const webIfc = new WEBIFC.IfcAPI();
            webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);
            await webIfc.Init();

            await ifcLoader.setup();
            const file = await fetch("https://thatopen.github.io/engine_components/resources/small.ifc");
            const buffer = await file.arrayBuffer();

            const typedArray = new Uint8Array(buffer);
            const model = await ifcLoader.load(typedArray);

            const data: BUI.TableGroupData[] = await computeRowData(
                components,
                [model],
                inverseAttributes,
                expressID
            );
            const modelID = webIfc.OpenModel(typedArray);
            const exported: IfcProperties = await exporter.export(webIfc, modelID);
            // console.log("exported", exported as FRAGS.IfcProperties)

            // Assuming ifcPropertiesData is an object with keys as numbers (expressID)
            const extendedElements = extendElementsWithProperties(
                data,
                exported
            );

            assignUniqueExpressIds(extendedElements, new Set());

            console.log('Extended Elements:', extendedElements);

            setTreeData(data);

            setModel(model);
        }

        fetchAndLoad();

        return () => {
            isLoaingInprogress = false;
        }
    }, [])


    return (
        <div >
            <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;

        </div>
    );
};

export default IfcJsonExporter;
