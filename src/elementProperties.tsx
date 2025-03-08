import React, { useEffect, useRef, useState } from "react";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc"; // adjust the import path as needed
import { computeRowData } from "./component/relationTree/TreeManager";

const inverseAttributes: OBC.InverseAttribute[] = ["IsDecomposedBy", "ContainsElements"];

const ElementPropertiesComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [treeData, setTreeData] = useState<BUI.TableGroupData[]>([]); // State to store table data
    
    useEffect(() => {
        // Initialize BUI manager
        BUI.Manager.init();

        // Create the BIM viewport element (a custom element)
        const viewport = document.createElement("bim-viewport");

        // Initialize components and create the world
        const components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        // Set up the scene, renderer, and camera
        const sceneComponent = new OBC.SimpleScene(components);
        sceneComponent.setup();
        world.scene = sceneComponent;

        const rendererComponent = new OBC.SimpleRenderer(components, viewport);
        world.renderer = rendererComponent;

        const cameraComponent = new OBC.SimpleCamera(components);
        world.camera = cameraComponent;
        cameraComponent.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

        // Handle viewport resize
        viewport.addEventListener("resize", () => {
            rendererComponent.resize();
            cameraComponent.updateAspect();
        });

        // Initialize all components
        components.init();

        // Create grids (adds grid helpers to the world)
        const grids = components.get(OBC.Grids);
        grids.create(world);

        // Asynchronously load the IFC model and process its relations
        (async () => {
            const ifcLoader = components.get(OBC.IfcLoader);
            await ifcLoader.setup();
            const file = await fetch(
                "https://thatopen.github.io/engine_ui-components/resources/small.ifc"
            );
            const buffer = await file.arrayBuffer();
            const typedArray = new Uint8Array(buffer);
            const model = await ifcLoader.load(typedArray);
            world.scene.three.add(model);

            // Process relations index for the model
            const indexer = components.get(OBC.IfcRelationsIndexer);
            await indexer.process(model);

            const data: BUI.TableGroupData[] = await computeRowData(
                components,
                [model],
                inverseAttributes,
                null
            );

            setTreeData(data);

            console.log("data", data);
        })();

        // Create the properties table using the CUI functional component.
        // Assume this returns an object with a DOM element (propertiesTable)
        // and a function (updatePropertiesTable) to update it.
        const [propertiesTable, updatePropertiesTable] =
            CUI.tables.elementProperties({
                components,
                fragmentIdMap: {},
            });
        propertiesTable.preserveStructureOnFilter = true;
        propertiesTable.indentationInText = false;

        // Set up the highlighter events to update the table when an element is selected
        const highlighter = components.get(OBF.Highlighter);
        highlighter.setup({ world });
        highlighter.events.select.onHighlight.add((fragmentIdMap: any) => {
            console.log("fragmentIdMap", fragmentIdMap);
            updatePropertiesTable({ fragmentIdMap });
        });
        highlighter.events.select.onClear.add(() =>
            updatePropertiesTable({ fragmentIdMap: {} })
        );

        // Create a panel for the properties table.
        // Here we build a simple DOM structure with buttons and an input,
        // and then append the propertiesTable element.
        const panelContainer = document.createElement("div");
        panelContainer.className = "bim-panel";

        // Create a section for buttons and search input
        const section = document.createElement("div");
        section.className = "bim-panel-section";
        section.style.marginBottom = "1rem";
        section.innerHTML = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <button id="expandBtn">${propertiesTable.expanded ? "Collapse" : "Expand"}</button>
        <button id="copyBtn">Copy as TSV</button>
        <button id="getAllPropsBtn">Get All Props</button>
      </div>
      <input type="text" id="searchInput" placeholder="Search Property" style="width: 100%; padding: 0.5rem;" />
    `;
        panelContainer.appendChild(section);
        // Append the properties table element (assumed to be a DOM node)
        panelContainer.appendChild(propertiesTable);

        // Event handlers for panel controls
        const onTextInput = (e: Event) => {
            const input = e.target as HTMLInputElement;
            propertiesTable.queryString = input.value !== "" ? input.value : null;
        };

        const expandTable = (e: Event) => {
            const button = e.target as HTMLButtonElement;
            propertiesTable.expanded = !propertiesTable.expanded;
            button.innerText = propertiesTable.expanded ? "Collapse" : "Expand";
        };

        const copyAsTSV = async () => {
            await navigator.clipboard.writeText(propertiesTable.tsv);
            console.log("propertiesTable", propertiesTable.value)
        };

        const getAllPRops = async () => {
            console.log("getAll props");

        };

        const expandBtn = section.querySelector("#expandBtn");
        const copyBtn = section.querySelector("#copyBtn");
        const searchInput = section.querySelector("#searchInput");
        const getAllPropsBtn = section.querySelector("#getAllPropsBtn");

        if (expandBtn) {
            expandBtn.addEventListener("click", expandTable);
        }
        if (copyBtn) {
            copyBtn.addEventListener("click", copyAsTSV);
        }
        if (searchInput) {
            searchInput.addEventListener("input", onTextInput);
        }

        if (getAllPropsBtn) {
            getAllPropsBtn.addEventListener("click", getAllPRops);
        }

        // Create a grid layout that holds the panel and viewport.
        // For simplicity we use a CSS grid on a container element.
        const gridContainer = document.createElement("div");
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = "25rem 1fr";
        gridContainer.style.height = "100vh";
        gridContainer.style.gap = "1rem";
        gridContainer.appendChild(panelContainer);
        gridContainer.appendChild(viewport);

        // Append the grid layout to the React container
        if (containerRef.current) {
            containerRef.current.appendChild(gridContainer);
        }

        // Cleanup on component unmount
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, []);

    return <div ref={containerRef} />;
};

export default ElementPropertiesComponent;
