
// Example Usage
// File: App.tsx
import React from "react";
import RelationsTree, { TreeNode } from "./component/relationTree";

const mockData: TreeNode[] = [
  {
    id: 1,
    label: "Node 1",
    children: [
      { id: 2, label: "Child Node 1" },
      {
        id: 3,
        label: "Child Node 2",
        children: [{ id: 4, label: "Grandchild Node" }],
      },
    ],
  },
  {
    id: 5,
    label: "Node 2",
  },
];

const ComponentExample: React.FC = () => {
  const handleNodeSelect = (node: TreeNode) => {
    console.log("Selected node:", node);
  };

  return (
    <div>
      <h1>Relations Tree</h1>
      <RelationsTree nodes={mockData} onNodeSelect={handleNodeSelect} />
    </div>
  );
};

export default ComponentExample;