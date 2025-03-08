import React, { useEffect, useRef, useState } from 'react';
import * as WEBIFC from 'web-ifc';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import * as OBF from '@thatopen/components-front';

type EntityAttributesProps = {
  components: OBC.Components;
};

const EntityAttributes: React.FC<EntityAttributesProps> = ({ components }) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [attributesTable, setAttributesTable] = useState<BUI.Table | null>(null);

  useEffect(() => {
    // Initialize World, Scene, Renderer, and Camera
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();

    const sceneComponent = new OBC.SimpleScene(components);
    sceneComponent.setup();
    world.scene = sceneComponent;

    const viewport = document.createElement('bim-viewport');
    viewportRef.current?.appendChild(viewport);

    const rendererComponent = new OBC.SimpleRenderer(components, viewport);
    world.renderer = rendererComponent;

    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;
    cameraComponent.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

    viewport.addEventListener('resize', () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    });

    components.init();

    const grids = components.get(OBC.Grids);
    grids.create(world);

    // Load IFC Model
    const loadIfcModel = async () => {
      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup();

      const response = await fetch(
        'https://thatopen.github.io/engine_ui-components/resources/small.ifc'
      );
      const buffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(buffer);

      const model = await ifcLoader.load(typedArray);
      world.scene.three.add(model);

      // Process Relations
      const indexer = components.get(OBC.IfcRelationsIndexer);
      await indexer.process(model);
    };

    loadIfcModel();

    // Table Configuration
    const baseStyle: Record<string, string> = {
      padding: '0.25rem',
      borderRadius: '0.25rem',
    };

    const tableDefinition: BUI.TableDataTransform = {
      Entity: (entity, data) => {
        let style = {};
        if (entity === OBC.IfcCategoryMap[WEBIFC.IFCPROPERTYSET]) {
          style = { ...baseStyle, backgroundColor: 'purple', color: 'white' };
        }
        if (String(entity).includes('IFCWALL')) {
          style = { ...baseStyle, backgroundColor: 'green', color: 'white' };
        }
        return {
          content: <div style={BUI.styleMap(style)}>{entity}</div>,
          style,
        } as unknown as BUI.CellRenderValue;
      },
      PredefinedType: (type, data) => {
        const colors = ['#1c8d83', '#3c1c8d', '#386c19', '#837c24'];
        const randomIndex = Math.floor(Math.random() * colors.length);
        const backgroundColor = colors[randomIndex];
        const style = { ...baseStyle, backgroundColor, color: 'white' };
        return {
          content: <div style={BUI.styleMap(style)}>{type}</div>,
          style,
        } as unknown as BUI.CellRenderValue;
      },
      NominalValue: (value, data) => {
        let style = {};
        if (typeof value === 'boolean' && value === false) {
          style = { ...baseStyle, backgroundColor: '#b13535', color: 'white' };
        }
        if (typeof value === 'boolean' && value === true) {
          style = { ...baseStyle, backgroundColor: '#18882c', color: 'white' };
        }
        return {
          content: <div style={BUI.styleMap(style)}>{value}</div>,
          style,
        } as unknown as BUI.CellRenderValue;
      },
    };

    const [attributesTableInstance, updateAttributesTable] =
      CUI.tables.entityAttributes({
        components,
        fragmentIdMap: {},
        tableDefinition,
        attributesToInclude: () => [
          'Name',
          'ContainedInStructure',
          'HasProperties',
          'HasPropertySets',
          (name: string) => name.includes('Value'),
          (name: string) => name.startsWith('Material'),
          (name: string) => name.startsWith('Relating'),
          (name: string) => {
            const ignore = ['IsGroupedBy', 'IsDecomposedBy'];
            return name.startsWith('Is') && !ignore.includes(name);
          },
        ],
      });

    attributesTableInstance.expanded = true;
    attributesTableInstance.indentationInText = true;
    attributesTableInstance.preserveStructureOnFilter = true;

    setAttributesTable(attributesTableInstance);

    // Set up Highlighter
    const highlighter = components.get(OBF.Highlighter);
    highlighter.setup({ world });

    highlighter.events.select.onHighlight.add((fragmentIdMap) => {
      updateAttributesTable({ fragmentIdMap });
    });

    highlighter.events.select.onClear.add(() => {
      updateAttributesTable({ fragmentIdMap: {} });
    });
  }, [components]);

  const handleExportJSON = () => {
    attributesTable?.downloadData('entities-attributes');
  };

  const handleCopyTSV = async () => {
    if (attributesTable) {
      await navigator.clipboard.writeText(attributesTable.tsv);
      alert(
        'Table data copied as TSV! Try pasting it in a spreadsheet application.'
      );
    }
  };

  return (
    <div>
      <div ref={viewportRef} style={{ height: '400px', width: '100%' }}></div>
      <div>
        <div>
          <div label="Entity Attributes" fixed>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleExportJSON}>
                Export JSON
              </button>
              <button onClick={handleCopyTSV}>Copy TSV</button>
            </div>
            {attributesTable}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityAttributes;
