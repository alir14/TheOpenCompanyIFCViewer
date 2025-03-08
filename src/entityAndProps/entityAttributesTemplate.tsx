import React, { useEffect, useRef } from 'react';
import * as FRAGS from '@thatopen/fragments';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { InverseAttribute } from '@thatopen/components/dist/ifc/IfcRelationsIndexer/src/types';

type Attributes = string | ((name: string) => boolean);

type EntityAttributesUIState = {
  components: OBC.Components;
  fragmentIdMap: FRAGS.FragmentIdMap;
  tableDefinition: BUI.TableDataTransform;
  editable?: boolean;
  attributesToInclude?: Attributes[] | ((defaultAttributes: Attributes[]) => Attributes[]);
};

const defaultAttributes: Attributes[] = [
  'Name',
  'ContainedInStructure',
  'ForLayerSet',
  'LayerThickness',
  'HasProperties',
  'HasAssociations',
  'HasAssignments',
  'HasPropertySets',
  'PredefinedType',
  'Quantities',
  'ReferencedSource',
  'Identification',
  (name: string) => name.includes('Value'),
  (name: string) => name.startsWith('Material'),
  (name: string) => name.startsWith('Relating'),
  (name: string) => {
    const ignore = ['IsGroupedBy', 'IsDecomposedBy'];
    return name.startsWith('Is') && !ignore.includes(name);
  },
];

const EntityAttributesTemplate: React.FC<EntityAttributesUIState> = ({
  components,
  fragmentIdMap,
  tableDefinition,
  editable = false,
  attributesToInclude = defaultAttributes,
}) => {
  const tableRef = useRef<BUI.Table | null>(null);

  useEffect(() => {
    const processEntityAttributes = async (
      model: FRAGS.FragmentsGroup,
      expressID: number,
      attributes: Attributes[] = defaultAttributes
    ): Promise<BUI.TableGroupData> => {
      const indexer = components.get(OBC.IfcRelationsIndexer);
      const attributesData = await model.getProperties(expressID);
      if (!attributesData) {
        return { data: { Entity: `${expressID} properties not found...` } };
      }

      const modelRelations = indexer.relationMaps[model.uuid];
      const entityRow: BUI.TableGroupData = { data: {} };

      for (const name in attributesData) {
        const nameIncluded = attributes.some((attr) =>
          typeof attr === 'string' ? attr === name : attr(name)
        );

        if (!nameIncluded) continue;

        const attributeValue = attributesData[name];
        if (!attributeValue) continue;

        if (attributeValue.type === 5) {
          if (!entityRow.children) entityRow.children = [];
          const row = await processEntityAttributes(
            model,
            attributeValue.value,
            attributes
          );
          entityRow.children.push(row);
        } else if (typeof attributeValue === 'object' && !Array.isArray(attributeValue)) {
          const { value } = attributeValue;
          entityRow.data[name] = editable ? (
            <input
              type="text"
              defaultValue={value}
              onBlur={(e) => {
                // Update logic here
              }}
            />
          ) : (
            value
          );
        } else {
          entityRow.data[name] = attributeValue;
        }
      }

      if (modelRelations?.get(attributesData.expressID)) {
        const entityRelations = modelRelations.get(attributesData.expressID)!;
        for (const name of attributes) {
          const targetAttributes: number[] = [];
          if (typeof name === 'string') {
            const index = indexer._inverseAttributes.indexOf(name as InverseAttribute);
            if (index !== -1) targetAttributes.push(index);
          } else {
            const matchingAttributes = indexer._inverseAttributes.filter((attr) => name(attr));
            matchingAttributes.forEach((attr) => {
              const index = indexer._inverseAttributes.indexOf(attr);
              if (index !== -1) targetAttributes.push(index);
            });
          }

          for (const attr of targetAttributes) {
            const relations = entityRelations.get(attr);
            if (!relations) continue;

            for (const relation of relations) {
              const row = await processEntityAttributes(model, relation, attributes);
              if (!entityRow.children) entityRow.children = [];
              entityRow.children.push(row);
            }
          }
        }
      }

      return entityRow;
    };

    const setupTable = async () => {
      const fragments = components.get(OBC.FragmentsManager);
      const groups: BUI.TableGroupData[] = [];
      const fragmentData: {
        model: FRAGS.FragmentsGroup;
        expressIDs: Set<number>;
      }[] = [];

      Object.entries(fragmentIdMap).forEach(([fragID, expressIDs]) => {
        const fragment = fragments.list.get(fragID);
        if (!fragment || !fragment.group) return;

        const model = fragment.group;
        const existing = fragmentData.find((data) => data.model === model);
        if (existing) {
          expressIDs.forEach((id) => existing.expressIDs.add(id));
        } else {
          fragmentData.push({ model, expressIDs: new Set(expressIDs) });
        }
      });

      for (const { model, expressIDs } of fragmentData) {
        for (const id of expressIDs) {
          const row = await processEntityAttributes(model, id, attributesToInclude as Attributes[]);
          groups.push(row);
        }
      }

      if (tableRef.current) {
        tableRef.current.dataTransform = tableDefinition;
        tableRef.current.data = groups;
        tableRef.current.columns = [{ name: 'Entity', width: 'minmax(15rem, 1fr)' }];
      }
    };

    setupTable();
  }, [components, fragmentIdMap, attributesToInclude, tableDefinition, editable]);

  return <bim-table ref={(el) => (tableRef.current = el as BUI.Table)} />;
};

export default EntityAttributesTemplate;
