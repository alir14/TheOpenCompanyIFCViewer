// File: App.tsx
import React, { useEffect, useRef, useState } from "react";
import RelationsTree from "./component/relationTree";
import LoadIfcButton from "./component/loadIfcButton";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";

const RelationTreeExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ifcLoader, setIFCLoader] = useState<OBC.IfcLoader>();
  const [world, setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>>();
  const [model, setModel] = useState<FRAGS.FragmentsGroup>();
  // const [indexer, setIndexer] = useState<OBC.IfcRelationsIndexer>();
  const components = new OBC.Components();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const container = containerRef.current;

    const worlds = components.get(OBC.Worlds);

    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();
    world.scene = new OBC.SimpleScene(components);

    const rendererComponent = new OBC.SimpleRenderer(components, container);
    world.renderer = rendererComponent;

    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;

    container.addEventListener("resize", () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    });

    components.init();
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    world.scene.setup();

    const grids = components.get(OBC.Grids);
    grids.create(world);

    const ifcLoader = components.get(OBC.IfcLoader);
    const setUpIFCLoaderAsync = async () => {
      await ifcLoader.setup();

      setIFCLoader(ifcLoader);
    }

    setUpIFCLoaderAsync();

    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });
    highlighter.zoomToSelection = true;


    setWorld(world);
  }, [])

  const handleOnModelLoaded = (model: FRAGS.FragmentsGroup) => {
    if (model?.uuid) {
      

      // setIndexer(indexer);
      setModel(model);
    }

  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "30rem 1fr", height: "100vh" }}>
      <div className="panel" style={{ padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Relations Tree</h2>
        <div className="panel-section">
          <LoadIfcButton
            ifcLoader={ifcLoader}
            world={world}
            handleOnModelLoaded={handleOnModelLoaded} />
          <input
            type="text"
            placeholder="Search..."
            // onChange={handleSearch}
            style={{
              width: "100%",
              padding: "0.5rem",
              margin: "1rem 0",
              boxSizing: "border-box",
            }}
          />
          {
            model?.uuid &&
            <RelationsTree components={components} model={model} />
          }
        </div>
      </div>
      <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;

    </div>
  );
};

export default RelationTreeExample;
