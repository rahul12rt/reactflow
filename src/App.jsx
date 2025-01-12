import { useCallback, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import { initialEdges, initialNodes } from "./constant";
import GetToken from "./components/generateToken";
import UploadImage from "./components/uploadImage";
import DataService from "./components/dataService";
import { addEdge } from "reactflow";
import removeBackgroundImage from "./utlis/removeBackgroundImage";
import "./App.css";
import { Position } from "@xyflow/react";
import PropTypes from "prop-types";
import manifest from "./utlis/manifest";
import CustomCardNode from "./components/customCardNode";

const ImageNode = ({ data }) => {
  return (
    <div className="container">
      <div className="header">Background Removed Preview</div>
      <div className="nodeContainer">
        {data.imageUrl && (
          <iframe src={data.imageUrl} className="iframeCanvas" />
        )}
        <Handle type="target" position={Position.Left} />
      </div>
    </div>
  );
};

ImageNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedValue, setSelectedValue] = useState("");

  const [userData, setUserData] = useState({
    auth: { token: "", clientId: "" },
    files: { createFile: "", getFile: "" },
  });

  const options = [
    { value: "3", label: "Remove Background" },
    { value: "4", label: "Manifest" },
    { value: "5", label: "PSD Text edit" },
  ];

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedLabel = options.find(
      (opt) => opt.value === selectedId
    )?.label;

    if (selectedId && !nodes.some((node) => node.id === selectedId)) {
      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: selectedId,
          data: { label: selectedLabel },
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          type: "dataService",
        },
      ]);
    }

    setSelectedValue(selectedId);
  };

  const nodeTypes = useCallback(
    {
      getToken: (props) => <GetToken {...props} setUserData={setUserData} />,
      createFileName: (props) => (
        <UploadImage {...props} setUserData={setUserData} />
      ),
      dataService: DataService,
      imageNode: ImageNode,
      customCardNode: CustomCardNode
    },
    []
  );

  const onConnect = useCallback(
    (connections) => {
      const newEdge = {
        ...connections,
        animated: true,
        id: `${edges.length + 1}`,
      };
      setEdges((prevEdges) => {
        const updatedEdges = addEdge(newEdge, prevEdges);
        if (connections.source === "2" && connections.target === "3") {
          removeBackgroundImage(userData, setNodes, setEdges);
        }else if (connections.source === "2" && connections.target === "4") {
          manifest(userData, setNodes, setEdges)
        }

        if (connections.target === "5") {
          setNodes((prevNodes) => {
            const sourceNode = prevNodes.find((node) => node.id === connections.source);
            console.log("Connected to Node 5:", sourceNode?.data?.child.id, userData.files);
            return prevNodes; // No change to nodes
          });
        }
  
        return updatedEdges;
      });
    },
    [edges, setEdges, userData]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ marginBottom: 20 }}>
        <select value={selectedValue} onChange={handleSelectChange}>
          <option value="">Select Node</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};


export default App;
