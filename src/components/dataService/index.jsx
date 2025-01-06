import { Position } from "@xyflow/react";
import PropTypes from "prop-types";
import { Handle, useReactFlow } from "reactflow";
import { useState } from "react";

const DataService = ({ data, id }) => {
  const { setNodes } = useReactFlow();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <div
      className="container"
      onClick={handleClick}
      style={{ display: "flex", alignItems: "center", gap: 20 }}
    >
      <p>{data.label}</p>
      <div
        className="closeIcon"
        onClick={() =>
          setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id))
        }
        style={{
          cursor: "pointer",
          color: "red",
          fontWeight: "bold",
          marginLeft: "auto",
        }}
      >
        X
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

DataService.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired, 
};

export default DataService;
