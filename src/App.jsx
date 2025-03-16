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
import CreateFile from "./components/uploadImage";
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
import {  Button, defaultTheme, Provider } from "@adobe/react-spectrum";
import {ToastContainer} from '@react-spectrum/toast'
import UploadImageNode from "./components/UploadFile";
import FilePreviewNode from "./components/filePreviewNode";
import CustomEdge from "./components/edge";
import replaceSO from "./utlis/replaceSmartObject";



const ImageNode = ({ data }) => {
  const handleDownload = async () => {
    if (data.imageUrl) {
      try {
        // Fetch the image blob
        const response = await fetch(data.imageUrl);
        const blob = await response.blob();
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'background_removed_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <div className="container" style={{textAlign:"start", position:"relative"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <h3 style={{padding:10}}>Background Removed Preview</h3>
      {/* <Button variant="accent" onPress={handleDownload}>Download</Button> */}
      </div>
  
      <div className="nodeContainer">
        {data.imageUrl && (
          <>
            <iframe src={data.imageUrl} className="iframeCanvas" />
          </>
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
  const [editedImageURL, setEditedImageURL] = useState()
  const [selectedValue, setSelectedValue] = useState("");

  const [userData, setUserData] = useState({
    auth: { token: "", clientId: "" },
    files: { createFile: "", getFile: "" },
  });

  const options = [
    { value: "5", label: "Remove Background", parent:"PS" },
    { value: "6", label: "Manifest", parent:"PS" },
    { value: "7", label: "PSD Text edit", parent:"PS" },
    { value: "8", label: "Generate Token", parent:"GT" },
    { value: "16", label: "Replace Smart Object", parent:"PS" },
  ];
  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedOption = options.find((opt) => opt.value === selectedId);
  
    if (selectedOption && !nodes.some((node) => node.id === selectedId)) {
      const lastNode = nodes[nodes.length - 1];
      const newPosition = lastNode
        ? { x: lastNode.position.x + 400, y: lastNode.position.y } 
        : { x: 0, y: 0 };
      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: selectedId,
          data: { 
            ...selectedOption, 
            options,
          },
          position: newPosition,
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
      // getToken: (props) => <GetToken {...props} setUserData={setUserData} />,
      createFileName: (props) => (
        <CreateFile {...props} setUserData={setUserData} />
      ),
      dataService: (props) => (
        <DataService
          {...props}
          data={{ ...props.data, options }}
          setUserData={setUserData}
    
        />
      ),
      uploadImageNode:(props) => (
        <UploadImageNode
          {...props}
          data={{ ...props.data }}
          setUserData={setUserData}
          userData={userData}
        />
      ),
      filePreviewNode: FilePreviewNode,
      imageNode: ImageNode,
      customCardNode: (props) => (
        <CustomCardNode
          {...props}
          setEditedImageURL={setEditedImageURL}
          data={{ ...props.data, updateNodeData, setEditedText }}
        />
      ),
    },
    [userData]
  );

      // Function to delete an edge
      const handleDeleteEdge = (edgeId) => {
        setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeId));
      };
    
      const edgeTypes = {
        customEdge: (props) => (
          <CustomEdge {...props} data={{ onDelete: handleDeleteEdge }} />
        ),
      };

  const onConnect = useCallback(
    (connections) => {
      const newEdge = {
        ...connections,
        animated: true,
        id: `${edges.length + 1}`,
        type: "customEdge",
      };

     
      setEdges((prevEdges) => {
        const updatedEdges = addEdge(newEdge, prevEdges);
        const sourceNode = nodes.find((node) => node.id === connections.source);
        console.log(connections.target, sourceNode?.data?.fileType, connections.source)
        if (sourceNode?.data?.fileType === "imagePreview" && connections.target === "5") {
          removeBackgroundImage(userData, setNodes, setEdges);
        } else if (sourceNode?.data?.fileType === "imagePreview" && connections.target === "6") {
          manifest(userData, setNodes, setEdges);
        }

        if (connections.target === "7") {
          console.log("connected")
          setNodes((prevNodes) => {
            const sourceNode = prevNodes.find(
              (node) => node.id === connections.source
            );
            console.log(sourceNode)
            const id = sourceNode?.data?.child.id;
            psdEdits(editedText, userData, id, setNodes, setEdges);
        
            return prevNodes;
          });
        }

        
        if (connections.target === "16") {
          console.log("connected v2")
          setNodes((prevNodes) => {
            const sourceNode = prevNodes.find(
              (node) => node.id === connections.source
            );
            console.log(sourceNode)
            const id = sourceNode?.data?.child.id; 
            console.log(editedImageURL)   
            replaceSO(editedImageURL, userData, id, setNodes, setEdges)
            return prevNodes;
          });
        }

        return updatedEdges;
      });
    },
    [edges, setEdges, userData, editedText, setEditedText, editedImageURL, setEditedImageURL]
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
          edgeTypes={edgeTypes}
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
