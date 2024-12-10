import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { computeRowData, getRowFragmentIdMap } from "./TreeManager";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface RelationsTreeUIState {
  components: OBC.Components;
  model: FRAGS.FragmentsGroup;
  selectHighlighterName?: string;
  hoverHighlighterName?: string;
  inverseAttributes?: OBC.InverseAttribute[];
  expressID?: number;
  // indexer: OBC.IfcRelationsIndexer;
}

interface TreeViewComponentProps {
  data: any[]
}

const TreeViewComponent: React.FC<TreeViewComponentProps> = ({ data }) => {

  const renderTree = (nodes: any) => {
    console.log("nodes", nodes);
    return (
      <TreeItem
        key={nodes?.data?.Entity}
        itemId={nodes?.data?.expressID}
        label={`${nodes?.data?.Entity}${nodes?.data?.Name ? `: ${nodes?.data?.Name}` : ''}`}
      >
        {nodes.children && nodes.children.map((child: any) => renderTree(child))}
      </TreeItem>
    );
  }

  return (
    <SimpleTreeView>
      {data.map((node: any) => renderTree(node))}
    </SimpleTreeView>
  );
};

const RelationsTree: React.FC<RelationsTreeUIState> = ({
  components,
  model,
  selectHighlighterName = "select",
  hoverHighlighterName = "hover",
  inverseAttributes = ["IsDecomposedBy", "ContainsElements"],
  expressID,
  // indexer
}) => {
  const [tableData, setTableData] = useState<any[]>([]); // State to store table data

  useEffect(() => {
    // Compute row data when models or expressID change
    console.log("triger with Model", model);


    const fragmentsManager = components.get(OBC.FragmentsManager);
    // fragmentsManager.onFragmentsLoaded.add(async (model) => {
    //   if (world.scene) world.scene.three.add(model);
    // });

    const indexer = components.get(OBC.IfcRelationsIndexer);
    const processIndexer = async () => {
      if (model.hasProperties) await indexer.process(model);
    }
    processIndexer().then(() => {
      console.log("set model", indexer);
      const computeData = async () => {
        const data = await computeRowData(
          indexer,
          [model],
          inverseAttributes,
          expressID
        );
        console.log(data)
        setTableData(data);
      };

      computeData();
    });

  }, [model]);

  const handleMouseOver = (rowData: any) => {
    const highlighter = components.get(OBF.Highlighter);
    const fragmentIDMap = getRowFragmentIdMap(components, rowData);

    if (!hoverHighlighterName) return;

    if (fragmentIDMap) {
      highlighter.highlightByID(
        hoverHighlighterName,
        fragmentIDMap,
        true,
        false,
        highlighter.selection[selectHighlighterName] ?? {}
      );
    }

  };

  const handleMouseOut = () => {
    // const highlighter = components.get(OBF.Highlighter);
    // highlighter.clear(hoverHighlighterName);
  };

  const handleClick = (rowData: any) => {
    const highlighter = components.get(OBF.Highlighter);
    const fragmentIDMap = getRowFragmentIdMap(components, rowData);

    if (fragmentIDMap) {
      highlighter.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
    }
  };

  return (
    // <div>
    //   <h2>Relations Tree</h2>
    //   <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
    //     <thead>
    //       <tr>
    //         <th>Entity</th>
    //         <th>Name</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {tableData.map((rowData, index) => (
    //         <tr
    //           key={index}
    //           onMouseOver={() => handleMouseOver(rowData)}
    //           onMouseOut={handleMouseOut}
    //           onClick={() => handleClick(rowData)}
    //           style={{ cursor: "pointer" }}
    //         >
    //           <td>{rowData?.data?.Entity}</td>
    //           <td>{rowData?.data?.Name}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
    <TreeViewComponent data={tableData} />
  );
};

export default RelationsTree;
