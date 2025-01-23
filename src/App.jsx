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
import psdEdits from "./utlis/psdEdits";
import Header from "./components/header";
import { defaultTheme, Provider } from "@adobe/react-spectrum";
import {ToastContainer} from '@react-spectrum/toast'


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
  const [editedText, setEditedText] = useState();
  const [selectedValue, setSelectedValue] = useState("");

  const [userData, setUserData] = useState({
    auth: { token: "", clientId: "" },
    files: { createFile: "", getFile: "" },
  });

  const options = [
    { value: "3", label: "Remove Background", parent:"PS" },
    { value: "4", label: "Manifest", parent:"PS" },
    { value: "5", label: "PSD Text edit", parent:"PS" },
  ];

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedOption = options.find((opt) => opt.value === selectedId);
  
    if (selectedOption && !nodes.some((node) => node.id === selectedId)) {
      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: selectedId,
          data: { 
            ...selectedOption, 
            options, // Pass all options here 
          },
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          type: "dataService",
        },
      ]);
    }
  
    setSelectedValue(selectedId);
  };
  

  const updateNodeData = (id, newData) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const nodeTypes = useCallback(
    {
      getToken: (props) => <GetToken {...props} setUserData={setUserData} />,
      createFileName: (props) => (
        <UploadImage {...props} setUserData={setUserData} />
      ),
      dataService: (props) => (
        <DataService
          {...props}
          data={{ ...props.data, options }}
        />
      ),
      imageNode: ImageNode,
      customCardNode: (props) => (
        <CustomCardNode
          {...props}
          data={{ ...props.data, updateNodeData, setEditedText }}
        />
      ),
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
        } else if (connections.source === "2" && connections.target === "4") {
          manifest(userData, setNodes, setEdges);
        }

        if (connections.target === "5") {
          setNodes((prevNodes) => {
            const sourceNode = prevNodes.find(
              (node) => node.id === connections.source
            );
            const id = sourceNode?.data?.child.id;
            psdEdits(editedText, userData, id, setNodes, setEdges);
            return prevNodes;
          });
        }

        return updatedEdges;
      });
    },
    [edges, setEdges, userData, editedText, setEditedText]
  );

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Header options={options} handleSelectChange={handleSelectChange} selectedValue={selectedValue}/>
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
      <ToastContainer />
    </Provider>
  );
};

export default App;
