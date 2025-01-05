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
import { addEdge } from "reactflow";
import axios from "axios";
import "./App.css";
import { Position } from "@xyflow/react";

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

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [userData, setUserData] = useState({
    auth: { token: "", clientId: "" },
    files: { createFile: "", getFile: "" },
  });
  const [imgs, setimg] = useState();
  const [selectedValue, setSelectedValue] = useState("");

  const options = [
    { value: "3", label: "Remove Background" },
    { value: "4", label: "Create Mask" },
    { value: "5", label: "Generate Image" },
  ];

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedLabel = options.find((opt) => opt.value === selectedId)?.label;

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
          userData={userData}
        />
      ),
      dataService: DataService,
      imageNode: ImageNode,
    },
    [handleImageUpload]
  );

  const onConnect = useCallback(
    async (connections) => {
      const newEdge = {
        ...connections,
        animated: true,
        id: `${edges.length + 1}`,
      };

      setEdges((prevEdges) => {
        const updatedEdges = addEdge(newEdge, prevEdges);

        if (connections.source === "2" && connections.target === "3") {
          console.log("Remove Background Image", userData);
          removeBackgroundImage();
        } else if (connections.source === "2" && connections.target === "4") {
          console.log("Create Mask", userData);
        }

        return updatedEdges;
      });
    },
    [edges, setEdges, userData]
  );

  const removeBackgroundImage = async () => {
    try {
      const response = await axios.post(
        "http://localhost:1337/proxy/remove-bg",
        { userData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const href = response.data._links.self.href;

      const fetchStatus = async () => {
        const result = await axios.post(
          "http://localhost:1337/proxy/fetch-bg-status",
          {
            href,
            token: userData.auth.token.access_token,
            clientId: userData.auth.clientId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (result.data.status === "succeeded") {
          return result.data.url;
        } else if (result.data.status === "failed") {
          throw new Error("Background removal task failed.");
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        return fetchStatus();
      };

      const imageUrl = await fetchStatus();
      console.log("Received image URL:", imageUrl);
      setimg(imageUrl);
      const newNodeId = `node-${Date.now()}`;
      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: newNodeId,
          type: "imageNode",
          position: { x: 1850, y: 100 },
          data: { imageUrl },
        },
      ]);
      setEdges((prevEdges) => [
        ...prevEdges,
        {
          id: `edge-to-${newNodeId}`,
          source: "3",
          target: newNodeId,
          animated: true,
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

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
