import { Position } from "@xyflow/react";
import { Handle } from "reactflow";

const FilePreviewNode = ({ data }) => {
    return (
      <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px", background: "#f9f9f9" }}>
        <h3>File Preview</h3>
        <img src={data.fileUrl} alt="File Preview" style={{ maxWidth: "100%" }} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    );
  };
  
  export default FilePreviewNode;
  