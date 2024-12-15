import React, { useEffect, useState } from "react";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { TableGroupData } from "@thatopen/ui";
import { IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

interface TreeViewComponentProps {
  selectHighlighterName?: string;
  hoverHighlighterName?: string;
  treeData: TableGroupData[];
  handleClick:(item: TableGroupData) => void;
}

const TreeViewComponent: React.FC<TreeViewComponentProps> = ({
  hoverHighlighterName = "hover",
  treeData,
  handleClick
}) => {
  const [lastSelectedItem, setLastSelectedItem] = React.useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const findSelectedItem = (data: TableGroupData[], itemId: string): TableGroupData => {
    for (const item of data) {
      if (item.children && item.children.length > 0) {
        const found = findSelectedItem(item.children, itemId);
        if (found) {
          return found; // If the item is found in the children, return it
        }
      } else {
        if (item.data?.expressID?.toString() === itemId) {
          return item; // Return the item if it matches
        }
      }
    }
  }

  const handleItemSelectionToggle = (
    event: React.SyntheticEvent,
    itemId: string,
    isSelected: boolean,
  ) => {
    if (isSelected) {
      setLastSelectedItem(itemId);

      const selectedTableGroupData = findSelectedItem(treeData, itemId) || {} as TableGroupData;

      if (selectedTableGroupData.children?.length === 0)
        handleClick(selectedTableGroupData);
    }
  };

  const filterTree = (nodes: TableGroupData[], query: string): TableGroupData[] => {
    return nodes
      .map((node) => {
        const children = filterTree(node.children || [], query);
        const isMatch = node?.data?.Entity?.toString().toLowerCase().includes(query.toLowerCase()) ||
          node?.data?.Name?.toString().toLowerCase().includes(query.toLowerCase());

        if (isMatch || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter((node) => node !== null) as TableGroupData[];
  };

  const filteredTreeData = searchQuery ? filterTree(treeData, searchQuery) : treeData;

  const renderTree = (node: TableGroupData) => {
    return (
      <TreeItem
        key={`${node?.data?.expressID}-${node?.data?.Entity}`}
        itemId={`${node?.data?.expressID}`} //-${node?.data?.Entity}
        label={`${node?.data?.Entity}${node?.data?.Name ? `: ${node?.data?.Name}` : ''}`}
      >
        {node.children && node.children.map((child: any) => renderTree(child))}
      </TreeItem>
    );
  }

  return (
    <React.Fragment>
      <div>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>
      {lastSelectedItem == null
        ? 'No item selection recorded'
        : `Last selected item: ${lastSelectedItem}`}
      <SimpleTreeView onItemSelectionToggle={handleItemSelectionToggle}>
        {filteredTreeData.map((node: TableGroupData) => renderTree(node))}
      </SimpleTreeView>
    </React.Fragment>
  );
};

export default TreeViewComponent;