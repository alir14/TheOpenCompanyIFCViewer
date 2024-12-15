// File: App.tsx
import React, { useEffect, useRef, useState } from "react";
import RelationsTree from "./component/relationTree/treeViewComponent";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import { computeRowData, getRowFragmentIdMap } from "./component/relationTree/TreeManager";


const selectHighlighterName: string = "select";
const inverseAttributes: OBC.InverseAttribute[] = ["IsDecomposedBy", "ContainsElements"];

interface RelationTreeProps {
  expressID?: number;
}

const RelationTreeExample: React.FC<RelationTreeProps> = ({
  expressID,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState<FRAGS.FragmentsGroup>();
  const [treeData, setTreeData] = useState<BUI.TableGroupData[]>([]); // State to store table data
  const [highlighter, setHighlighter] = useState<OBF.Highlighter>();

  const components = new OBC.Components();

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
      setTreeData(data);

      setModel(model);
    }

    fetchAndLoad();

    return () => {
      isLoaingInprogress = false;
    }
  }, [])


  const handleClick = (item: BUI.TableGroupData) => {
    console.log("item.data", item.data)
    const fragmentIDMap = getRowFragmentIdMap(model, item.data);
    console.log("fragmentIDMap", fragmentIDMap)

    if (fragmentIDMap) {
      highlighter.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "30rem 1fr", height: "100vh" }}>
      <div className="panel" style={{ padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Relations Tree</h2>
        <div className="panel-section">
          {
            model?.uuid &&
            <RelationsTree treeData={treeData} handleClick={handleClick} />
          }
        </div>
      </div>
      <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;

    </div>
  );
};

export default RelationTreeExample;
