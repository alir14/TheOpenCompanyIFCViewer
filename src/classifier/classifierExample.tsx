import React, { useEffect, useState, useRef } from 'react';
import * as OBC from '@thatopen/components';
import { Container, Stack } from '@mui/material';
import ClassificationTreeTemplate from './classificationTreeTemplate';

const ClassificationsTreeComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [classifications, updateClassificationsTree] = useState<(string | { system: string; label: string })[]>();
  const componentRef = useRef<OBC.Components | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const components = new OBC.Components();

    // Setup World
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();

    const sceneComponent = new OBC.SimpleScene(components);
    sceneComponent.setup();
    world.scene = sceneComponent;

    const rendererComponent = new OBC.SimpleRenderer(components, container);
    world.renderer = rendererComponent;

    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;

    container.addEventListener('resize', () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    });

    // Initialize Grids and components
    const viewerGrids = components.get(OBC.Grids);
    viewerGrids.create(world);

    components.init();

    componentRef.current = components;

    // Load IFC
    const ifcLoader = components.get(OBC.IfcLoader);
    const fragmentsManager = components.get(OBC.FragmentsManager);

    fragmentsManager.onFragmentsLoaded.add((model) => {
      if (world.scene) world.scene.three.add(model);
    });

    const classifier = components.get(OBC.Classifier);

    fragmentsManager.onFragmentsLoaded.add(async (model) => {
      classifier.byEntity(model);
      await classifier.byPredefinedType(model);

      const classifications = [
        { system: 'entities', label: 'Entities' },
        { system: 'predefinedTypes', label: 'Predefined Types' },
      ] as (string | { system: string; label: string })[];

      updateClassificationsTree(classifications);
    });

    const fetchAndLoad = async () => {
      await ifcLoader.setup();
      //"http://localhost:9090/ifcBridgeSample.ifc" https://thatopen.github.io/engine_components/resources/small.ifc http://localhost:9090/ifcBridgeSample.ifc
      const file = await fetch("https://thatopen.github.io/engine_components/resources/small.ifc");
      const buffer = await file.arrayBuffer();

      const typedArray = new Uint8Array(buffer);
      await ifcLoader.load(typedArray);
    }

    fetchAndLoad();

  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '23rem 1fr', height: '100vh' }}>
      <div id="Classifications Tree">
        <div id="Classifications">
          {componentRef.current && classifications &&
            (
              <ClassificationTreeTemplate
                components={componentRef.current}
                classifications={classifications}
              />
            )
          }
        </div>
      </div>
      <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default ClassificationsTreeComponent;
