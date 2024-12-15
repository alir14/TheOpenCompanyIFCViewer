import React, { Component, useEffect, useRef } from 'react'
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

const PropertyName: string = "Property Name";
const PropertyValue: string = "Property Value";


const ModelComponentRelations = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const myComponent = new OBC.Components();
    const worlds = myComponent.get(OBC.Worlds);

    const viewer = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer>();

    viewer.scene = new OBC.SimpleScene(myComponent);
    viewer.renderer = new OBC.SimpleRenderer(myComponent, containerRef.current);
    viewer.camera = new OBC.SimpleCamera(myComponent);

    myComponent.init();

    viewer.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    viewer.scene.setup();

    const grids = myComponent.get(OBC.Grids);
    grids.create(viewer);

    const ifcLoader = myComponent.get(OBC.IfcLoader);
    const indexer = myComponent.get(OBC.IfcRelationsIndexer);

    // let isFetchAndLoadCompleted = false;
    const fetchAndLoad = async () => {
      await ifcLoader.setup();
      const file = await fetch("https://thatopen.github.io/engine_components/resources/small.ifc");
      const buffer = await file.arrayBuffer();

      const typedArray = new Uint8Array(buffer);
      const model = await ifcLoader.load(typedArray);

      viewer.scene.three.add(model);

      await indexer.process(model);

      const psets = indexer.getEntityRelations(model, 6518, "IsDefinedBy");
      if (psets) {
        for (const expressID of psets) {
          // You can get the pset attributes like this
          const pset = await model.getProperties(expressID);
          console.log("pset", pset);
          // You can get the pset props like this or iterate over pset.HasProperties yourself
          await OBC.IfcPropertiesUtils.getPsetProps(
            model,
            expressID,
            async (propExpressID) => {
              const prop = await model.getProperties(propExpressID);
              console.log(prop);
            },
          );
        }
      }
      const json = indexer.serializeModelRelations(model);
      console.log("json", json);

    }

    fetchAndLoad();

  }, [])

  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

export default ModelComponentRelations