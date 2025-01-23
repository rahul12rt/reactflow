import { Position } from "@xyflow/react";
import PropTypes from "prop-types";
import { Handle, useReactFlow } from "reactflow";
import { useState } from "react";
import styles from "./index.module.css";

const DataService = ({ data, id }) => {
  const { setNodes } = useReactFlow();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  // Define UI mappings for parent types
  const parentToUI = {
    PS: {
      image: "/logo/Adobe-Photoshop-Symbol.jpg", // Replace with your Photoshop image path
      color: "#000", // Example color for PS parent
      displayName: "Photoshop", // Text to display for PS
    },
    FF: {
      image: "/logo/Adobe-Firefly-Logo.png", // Replace with your Firefly image path
      color: "#ff851b", // Example color for FF parent
      displayName: "Firefly", // Text to display for FF
    },
  };

  const currentUI = parentToUI[data.parent] || {};

  return (
    <div style={{ position: "relative" }}>
      <div
        className={`${styles.container} ${clicked ? styles.clicked : ""}`}
        onClick={handleClick}
        style={{
          backgroundColor: currentUI.color || "#f5f5f5", // Default fallback color
        }}
      >
        <img src={currentUI.image} alt={data.parent} className={styles.icon} />
      </div>

      <div className={styles.textContainer}>
        {/* Display "Firefly" for FF and "Photoshop" for PS */}
        <p className={styles.title}>{currentUI.displayName || data.parent}</p>
        <p className={styles.subtitle}>{data.label}</p>
      </div>
{/* 
      <div
        className={styles.closeIcon}
        onClick={(e) => {
          e.stopPropagation();
          setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
        }}
      >
        X
      </div> */}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

DataService.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired, // Ensure parent is passed
  }).isRequired,
  id: PropTypes.string.isRequired,
};

export default DataService;
