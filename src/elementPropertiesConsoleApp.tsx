import React, { useEffect, useRef } from "react";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

const IFCConsoleViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize BIM manager and create the viewport element
    BUI.Manager.init();
    const viewport = document.createElement("bim-viewport");

    // Initialize the components and world
    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();

    // Setup scene, renderer, and camera
    const sceneComponent = new OBC.SimpleScene(components);
    sceneComponent.setup();
    world.scene = sceneComponent;

    const rendererComponent = new OBC.SimpleRenderer(components, viewport);
    world.renderer = rendererComponent;

    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;
    cameraComponent.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

    // Handle viewport resize events
    viewport.addEventListener("resize", () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    });

    // Initialize all components and add grid helpers
    components.init();
    const grids = components.get(OBC.Grids);
    grids.create(world);

    // Asynchronously load the IFC model
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

      // Process the IFC relations index (improves element data lookup)
      const indexer = components.get(OBC.IfcRelationsIndexer);
      await indexer.process(model);
    })();

    // Setup the highlighter to log selected element data in JSON
    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });
    highlighter.events.select.onHighlight.add((fragmentIdMap: any) => {
      console.log(
        "Selected element properties (JSON):",
        JSON.stringify(fragmentIdMap, null, 2)
      );
    });
    highlighter.events.select.onClear.add(() => {
      console.log("Selection cleared");
    });

    // Append the viewport to a container with a simple layout
    const gridContainer = document.createElement("div");
    gridContainer.style.display = "grid";
    gridContainer.style.height = "100vh";
    gridContainer.appendChild(viewport);

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

export default IFCConsoleViewer;
