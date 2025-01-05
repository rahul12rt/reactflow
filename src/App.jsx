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
import GetToken from "./components/getToken";
import UploadImage from "./components/createFileName";
import DataService from "./components/dataService";
import handleConnections from "./connections";
import "./App.css";
import { Position } from "@xyflow/react";

const ImageNode = ({ data }) => {
  console.log(data)
  return (
    <div className="container">
           <div className="header">Removed Background Preview</div>
      <img src={data.imageUrl} style={{width:"100%"}}/>
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [userData, setUserData] = useState({
    auth: { token: "", clientId: "" },
    files: { createFile: "", getFile: "" },
  });

  const handleImageUpload = useCallback((url) => {
    setUploadedUrl(url);
  }, []);

  const nodeTypes = useCallback(
    {
      getToken: (props) => <GetToken {...props} setUserData={setUserData} />,
      createFileName: (props) => (
        <UploadImage
          {...props}
          onImageUpload={handleImageUpload}
          setUserData={setUserData}
        />
      ),
      dataService: DataService,
      imageNode: ImageNode,
    },
    [handleImageUpload]
  );

  const onConnect = useCallback(
    (connections) =>
      handleConnections(connections, edges, setEdges, setNodes, userData),
    [edges, setEdges, userData, setNodes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
